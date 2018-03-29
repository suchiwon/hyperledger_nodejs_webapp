var mongoose = require('mongoose');

var db = mongoose.connection;

db.on('error', console.error);
db.once('open', function() {
	console.log("Connected to mongod server");		
});

mongoose.connect('mongodb://localhost:27017/fileSharing');

var userSchema = mongoose.Schema({
	username: String,
	authorization: String,
	password: String
});

var User = mongoose.model('user', userSchema);

exports.getUserInfo = function(username, callback) {
	User.findOne({username:username}, function(err, user) {
		if (err) {
			callback(err, user);
		} else {
			callback(null, JSON.stringify(user));
		}
	});
}

exports.getUserList = function(params, callback) {
	User.find(function(err, users) {
		if (err) {
			callback(console.error(err));
		}
		console.log("getUserList: " + JSON.stringify(users));
		callback(JSON.stringify(users));
	});
}

exports.addUser = function(_username, _password, _auth) {

	var newUser = new User({
		username: _username,
		authorization: _auth,
		password: _password

	});

	newUser.save(function(err, data) {
		if (err)
			return console.error(err);

		console.dir(data);
	});
}
