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
    var users = MODEL('users').getUsers();

    controller.on('open', function(client) {
        client.id = client.user.id;
        for (user in controller.connections){
            for (var i = 0; i < users.length; i++){
                if (controller.connections[user].id == users[i].id){
                    users[i].chatOnline = true;
                    break;
                }
            }
        }
		controller.send(users);
	});

	controller.on('close', function(client) {
		for (var i = 0; i < users.length; i++){
            if (client.id == users[i].id){
                users[i].chatOnline = false;
                break;
            }
        }
		controller.send(users);
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
