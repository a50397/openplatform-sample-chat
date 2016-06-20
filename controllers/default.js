exports.install = function() {
	F.route('/', view_index, ['authorize']);

    F.websocket('/users/', socket_users, ['json','authorize']);
    F.websocket('/chats/{route}', socket_chats, ['json', 'authorize']);
};

function view_index() {
    var self = this;
    MODEL('users').init(self.user);
	self.view('index');
}

function socket_users(){
    var controller = this;
    var usersObj = MODEL('users').getUsersObj();

    controller.on('open', function(client) {
        client.id = client.user.id;
        MODEL('channels').putChannel(client.id, controller);
        //usersObj[client.id].chatOnline = true;
        for (user in controller.connections){
            usersObj[controller.connections[user].id].chatOnline = true;
        }
		controller.send(usersObj);
	});

	controller.on('close', function(client) {
        usersObj[client.id].chatOnline = false;
        MODEL('channels').putChannel(client.id, null);
		controller.send(usersObj);
	});

    controller.on('message',function(client, message){
        console.log('message????', message);
    });
}

function socket_chats(route){
    var controller = this;
    var usersObj = MODEL('users').getUsersObj();

    controller.on('open', function(client) {
        client.send(MODEL('chats').getChat(route));
	});

    controller.on('message', function(client, message) {
        MODEL('chats').updateChat(route, client.user.id, message.message);
        controller.send([[client.user.id, message.message]]);
        if (controller.online < 2){
            var parties = route.split('.');
            if (parties[0] === client.user.id)
                var chatPartner = parties[1];
            else
                var chatPartner = parties[0];
            if (usersObj[chatPartner].chatOnline){
                console.log("teraz by sme poslali...");
                MODEL('channels').getChannel(chatPartner).send({"notify":client.user.id});
                //usersObj[chatPartner].chatChannel.send({"notify":client.user.id});
            } else {
                OPENPLATFORM.notify(client.user.openplatform, chatPartner, "You've got chat message from " + client.user.alias, function(err, response) {
                    if (err)
                        console.log('Notifying a user without chat app installed');
                });
            }
        }
	});

	controller.on('close', function(client) {
        chat = null;
	});
}
