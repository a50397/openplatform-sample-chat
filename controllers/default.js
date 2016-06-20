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
        for (user in controller.connections){
            usersObj[controller.connections[user].id].chatOnline = true;
        }
		controller.send(usersObj);
	});

	controller.on('close', function(client) {
        usersObj[client.id].chatOnline = false;
		controller.send(usersObj);
	});

    controller.on('message',function(client, message){
        console.log('message????', message);
    });
}

function socket_chats(route){
    var controller = this;

    controller.on('open', function(client) {
        client.send(MODEL('chats').getChat(route));
	});

    controller.on('message', function(client, message) {
        MODEL('chats').updateChat(route, client.user.id, message.message);
        controller.send([[client.user.id, message.message]]);
	});

	controller.on('close', function(client) {
        chat = null;
	});
}
