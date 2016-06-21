$(document).ready(function() {
    var socket_users = null;
    var socket_chat = null;
    var myself = {};
    var chatPartner = {};

    OPENPLATFORM.getProfile(function(err, data) {
        if (err){
            alert('Error getting user');
        } else {
            myself = data;
        }
    });

    socket_users = new WebSocket('ws://'+window.location.host+'/users/');
    socket_users.onmessage = function(e){
        var users = JSON.parse(decodeURIComponent(e.data));
        var list_div = $('#partner-list');
        if (users.online) {
            $('div[data-id="'+users.online+'"] #onlineStatus').text('Online');
            $('div[data-id="'+users.online+'"] #onlineStatus').addClass('online');
        }
        else if (users.offline){
            $('div[data-id="'+users.offline+'"] #onlineStatus').text('Offline');
            $('div[data-id="'+users.offline+'"] #onlineStatus').removeClass('online');
        }
        else if (users.notify){
            var span = $('div[data-id="'+users.notify+'"] #onlineStatus');
            var unread = span.attr('data-unread');
            if (unread)
                unread = parseInt(unread,10) + 1;
            else
                unread = 1;
            //console.log('notified by ' + users.notify + " on " + unread);
            span.attr('data-unread', unread);
        } else if (users.unread) {
            for (actor in users.unread){
                if (users.unread[actor] > 0)
                    $('div[data-id="'+actor+'"] #onlineStatus').attr('data-unread', users.unread[actor]);
            }
        } else {
            //console.log(users);
            list_div.empty();
            jQuery.each(users, function(index,value){
                if (value.id !== myself.id){
                    var item = $('<div class="partners-list-item" data-id="'+value.id+'" ><img class="img-circle small-img" src="'+value.photo+'"><h4 style="margin-bottom:0px;">'+value.alias+'</h4><span class="onlineStatus mybadge" id="onlineStatus">'+(value.chatOnline?'Online':'Offline')+'</span></div>');
                    if (value.chatOnline)
                        item.find("#onlineStatus").addClass('online');
                    if (chatPartner.id === value.id){
                        item.addClass('partner-selected');
                    }
                    item.click(function(event){
                        jQuery.each($(".partner-selected"),function(index,value){
                            $(value).removeClass('partner-selected');
                        });
                        $(event.currentTarget).addClass('partner-selected');
                        $(event.currentTarget).find('#onlineStatus').removeAttr('data-unread');
                        chatPartner['id'] = value.id;
                        chatPartner['photo'] = value.photo;
                        chatPartner['alias'] = value.alias;
                        $('#selectedName').text(chatPartner['alias']);
                        setupChat();
                    });
                    item.appendTo(list_div);
                }
            });
            if (!chatPartner.id){
                $('div.partners-list-item').first().trigger('click');
            }
            else{
                $('div.partners-list-item').find('.partner-selected').trigger('click');
            }
        }
    };
    //socket_users.close();
    function setupChat(){
        var url = myself.id<chatPartner.id?myself.id+'.'+chatPartner.id:chatPartner.id+'.'+myself.id;
        var chat_list = $('#chat_area');

        if (socket_chat)
            socket_chat.close();
        chat_list.empty();
        socket_chat = new WebSocket('ws://'+window.location.host+'/chats/'+url);
        socket_chat.onmessage = function(e){
            var chat = JSON.parse(decodeURIComponent(e.data));
            for (var i = 0; i < chat.length; i++){
                var imageUrl = '';
                var classImg = '';
                var classText = '';
                if (chat[i][0] === myself.id){
                    classImg = 'large-img-right';
                    classText = 'chat-text-right';
                    imageUrl = myself.photo;
                } else {
                    imageUrl = chatPartner.photo;
                }
                var item = $('<li class="chatlist"><div class="wrap"><img class="img-circle large-img '+classImg+'" src="'+imageUrl+'"><div class="chat-text '+classText+'">'+smilefy(urlify(chat[i][1]))+'</div></div></li>');
                item.appendTo(chat_list);
            }
            //console.log(chat.length);
            //console.log($("#chat_area").prop('scrollHeight'));
            if (chat.length > 1)
                $("#chat_area").scrollTop($("#chat_area").prop('scrollHeight'));
            else
            $("#chat_area").animate({scrollTop: $("#chat_area").prop('scrollHeight')}, 1000);
        };
    }

    $('#chat_submit').click(function(event){
        var message = $('#chat_input').val();
        if (socket_chat && message.length > 0){
            socket_chat.send(encodeURIComponent(JSON.stringify({'message':message})));
            $('#chat_input').val('');
        }
    });

    $('#chat_input').keydown(function(event){
        if((event.keyCode || event.which) == 13){
            var message = $('#chat_input').val();
            if (socket_chat && message.length > 0){
                socket_chat.send(encodeURIComponent(JSON.stringify({'message':message})));
                $('#chat_input').val('');
            }
        }
    });


/*
The MIT License
Copyright 2006-2016 (c) Peter Širka <petersirka@gmail.com>
*/

    function smilefy(text) {
        var db = { ':-)': 1, ':)': 1, ';)': 8, ':D': 0, '8)': 5, ':((': 7, ':(': 3, ':|': 2, ':P': 6, ':O': 4, ':*': 9, '+1': 10, '1': 11, '\/': 12 };
        return text.replace(/(\-1|[:;8O\-)DP(|\*]|\+1){1,3}/g, function(match) {
            var clean = match.replace('-', '');
            var smile = db[clean];
            if (smile === undefined)
                return match;
            return '<span class="smiles smiles-' + smile + '"></span>';
        });
    }


    function urlify(text) {
        var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
        return text.replace(urlRegex, function(url,b,c) {
            var url2 = c === 'www.' ? 'http://' + url : url;
            return '<a href="' +url2+ '" target="_blank">' + url + '</a>';
        })
    }

});
