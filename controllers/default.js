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
        MODEL('channels').putChannel(client.id, client);
        //usersObj[client.id].chatOnline = true;
        for (user in controller.connections){
            usersObj[controller.connections[user].id].chatOnline = true;
        }
        client.send(usersObj);
        client.send({'unread':MODEL('chats').getUnread(client.id)});
		controller.send({'online':client.id});
	});

	controller.on('close', function(client) {
        usersObj[client.id].chatOnline = false;
        MODEL('channels').putChannel(client.id, null);
		controller.send({'offline':client.id});
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
        var parties = route.split('.');
        if (parties[0] === client.user.id)
            var chatPartner = parties[1];
        else
            var chatPartner = parties[0];
        MODEL('chats').setRead(client.user.id, chatPartner);
	});

    controller.on('message', function(client, message) {
        MODEL('chats').updateChat(route, client.user.id, message.message);
        controller.send([[client.user.id, message.message]]);
        console.log("online " + controller.online);
        if (controller.online < 2){
            console.log('Notifying');
            var parties = route.split('.');
            if (parties[0] === client.user.id)
                var chatPartner = parties[1];
            else
                var chatPartner = parties[0];
            if (usersObj[chatPartner].chatOnline){
                MODEL('channels').getChannel(chatPartner).send({"notify":client.user.id});
                MODEL('chats').updateUnread(chatPartner, client.user.id);

            } else {
                MODEL('chats').updateUnread(chatPartner, client.user.id);
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
