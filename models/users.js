exports.id = 'users';
var users = [];
var usersObj = {};
var channels = {};

exports.init = function(self) {
    OPENPLATFORM.getUsers(self.openplatform, self.id, function(err, response) {
        if (err){
            console.log("Error getting users -> ", err);
        } else {
            users = response;
            for (var i = 0; i < response.length; i++){
                if (response[i].has)
                    usersObj[response[i].id] = response[i];
            }
        }
    });
};

exports.getUsers = function(){
    return users;
}

exports.getUsersObj = function(){
    return usersObj;
}

