exports.id = 'chats';
var chats = {};

exports.getChat = function(route){
    if (!chats[route]){
        chats[route] = [];
    }
    return chats[route];
}

exports.updateChat = function(route, actor, chat){
    if (!chats[route]){
        chats[route] = [];
    }
    chats[route].push([actor, chat, new Date().getTime()]);
}

