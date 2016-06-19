exports.id = 'users';
var users = [];

exports.init = function(self) {
    OPENPLATFORM.getUsers(self.openplatform, self.id, function(err, response) {
        if (err){
            console.log("Error getting users -> ", err);
        } else {
            users = response;
        }
    });
};

exports.getUsers = function(){
    return users;
}
