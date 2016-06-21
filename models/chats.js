exports.id = 'chats';
var chats = {};
var unread = {};

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

exports.getUnread = function(actor){
    if (!unread[actor]){
        unread[actor] = {};
    }
    console.log('getUnread ',actor, unread[actor]);
    return unread[actor];

}

exports.updateUnread = function(actor, partner){
    //chats[route].unread[actor] += 1;
    if (!unread[actor]){
        unread[actor] = {};
    }
    if (!unread[actor][partner])
        unread[actor][partner] = 0;
    unread[actor][partner] += 1;
    console.log('unreadUpdate ',actor, unread[actor]);
}

exports.setRead = function(actor, partner){
    if (!unread[actor]){
        unread[actor] = {};
    }
    unread[actor][partner] = 0;
    console.log('setRead ',actor, unread[actor]);
}

