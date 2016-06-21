exports.id = 'chats';
var chats = {};

exports.getChat = function(route){
    if (!chats[route]){
        chats[route] = {}
        chats[route]['chat'] = []
        chats[route]['unread'] = {};
        chats[route]['unread'][route.split('.')[0]] = 0;
        chats[route]['unread'][route.split('.')[1]] = 0;
    }
    return chats[route];
}

exports.updateChat = function(route, actor, chat){
    if (!chats[route]){
        chats[route] = {}
        chats[route]['chat'] = []
        chats[route]['unread'] = {};
        chats[route]['unread'][route.split('.')[0]] = 0;
        chats[route]['unread'][route.split('.')[1]] = 0;
    }
    chats[route].chat.push([actor, chat, new Date().getTime()]);
}

