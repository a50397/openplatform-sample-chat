exports.id = 'chats';
var chats = {};

exports.init = function(self) {
};

exports.getChat = function(route){
    console.log('get chats');
    if (!chats[route]){
        chats[route] = [];
    }
    return chats[route];
}

exports.updateChat = function(route, actor, chat){
    console.log('updating ', route, actor, chat);
    if (!chats[route]){
        chats[route] = [];
    }
    chats[route].push([actor, chat, new Date().getTime()]);
}

