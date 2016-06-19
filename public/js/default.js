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
        //console.log(users);
        list_div.empty();
        jQuery.each(users, function(index,value){
            if (value.id !== myself.id){
                var item = $('<div class="partners-list-item"><img class="img-circle small-img" src="'+value.photo+'"><h4 style="margin-bottom:0px;">'+value.alias+'</h4><span class="onlineStatus" id="onlineStatus">'+(value.chatOnline?'Online':'Offline')+'</span></div>');
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
                var item = $('<li class="chatlist"><div class="wrap"><img class="img-circle large-img '+classImg+'" src="'+imageUrl+'"><div class="chat-text '+classText+'">'+chat[i][1]+'</div></div></li>');
                item.appendTo(chat_list);
                $('#chat_area').scrollTop($('#chat_area').height());
            }
        };
        //console.log(url);
    }

    $('#chat_submit').click(function(event){
            var message = $('#chat_input').val();
            if (socket_chat && message.length > 0){
                socket_chat.send(encodeURIComponent(JSON.stringify({'message':message})));
                $('#chat_input').val('');
            }
    });

});
