exports.id = 'channels';
var channels = {};

exports.putChannel = function(id, controller){
    channels[id] = controller;
}

exports.getChannel = function(id){
    return channels[id];
}
