module.exports = function(app, fs, jsonrpc, crypto, mongoDB) {

	var url_host = "http://localhost:4000/";

	var request = require('ajax-request');

	app.use(function(req, res, next) {
		var sess = req.session;

		if ((req.path === '/login' || (sess && sess.username))) {
			next();
		} else {
			console.log("not login yet");
			res.redirect("/login");
		}
	});

	app.use(function(req, res, next) {

		if (req.session) {
			res.locals.username = req.session.username;
			res.locals.auth	= req.session.auth;
		}
		next();
	});

    app.get('/', function(req, res) {
		console.log("sess info : " + req.session.username + " " + req.session.jwt);
        res.render('index.ejs', {
			username: req.session.username,
			jwt: req.session.jwt,
			auth: req.session.auth
		});
    });

	app.get('/login', function(req, res) {
		res.render('login.ejs');
	});

	app.post('/login', function(req, res) {

		console.log("login post");
		var sess;
		sess = req.session;

		console.log(req.body);

		var username = req.body.username;
		var password = req.body.password;

		var result = {};

		mongoDB.getUserInfo(username, function(err, data) {
			if (!err) {

				console.log("login info:" + data);
				var passwordHash = crypto.getHash(password);
				var authorization = JSON.parse(data).authorization;

				if (passwordHash == JSON.parse(data).password) {
					var JSONdata = {
						username : username,
						orgName : "Org1"
					}
					var params = "username=" + username + "&orgName=Org1";

					request({
						url: url_host + "users",
						method: 'POST',
						data: JSONdata
						},
						function(err, response, body) {
					
						data = body;
					
						console.log(data);

						if (JSON.parse(data).success == false) {
							console.log("node login error");
							//res.redirect("back");
							res.end("fabric user login error");
						} else {
	
							var jwt =JSON.parse(data).token;

							console.log("jwt = " + jwt);
					
							sess.jwt = jwt;
							result["success"] = 1;
							sess.username = username;
							sess.auth = authorization;

							console.log("auth : " + authorization);
							console.log("sess : " + JSON.stringify(sess));
							res.redirect('/filelist');
						}
					});

				} else {
					result["success"] = 0;
					result["error"] = "incorrect";
					res.json(result);

				}
			} else {
				result["success"] = 0;
				result["error"] = "not found";
				res.json(result);
				return;
			}
		});
/*
		fs.readFile(__dirname + "/../data/user.json", "utf8", function(err, data) {
			var users = JSON.parse(data);

			var result = {};
			
			console.log(username + " " + password);

			if (!users[username]) {
				result["success"] = 0;
				result["error"] = "not found";
				res.json(result);
				return;
			}

			if(users[username]["password"] == password) {
				
				var JSONdata = {
					username : username,
					orgName : "Org1"
				}
				var params = "username=" + username + "&orgName=Org1";

				request({
					url: url_host + "users",
					method: 'POST',
					data: JSONdata
					},
					function(err, response, body) {
					
					data = body;
					
					console.log(data);

					if (JSON.parse(data).success == false) {
						console.log("node login error");
						//res.redirect("back");
						res.end("fabric user login error");
					} else {

						var jwt =JSON.parse(data).token;

						console.log("jwt = " + jwt);
					
						sess.jwt = jwt;
						result["success"] = 1;
						sess.username = username;
						sess.name = users[username]["name"];
						//res.json(result);
						res.redirect('/filelist');
					}
					});
			} else {
				result["success"] = 0;
				result["error"] = "incorrect";
				res.json(result);
			}
		})
*/
	});
    
    app.get('/monitor', function(req, res) {
       res.render('monitor.ejs'); 
    });
    
    app.get('/filelist', function(req, res) {
        res.render('filelist.ejs', {
			username: req.session.username,
			jwt: req.session.jwt
		});
    });

	app.get('/userlist', function(req, res) {
		fs.readFile(__dirname + "/../data/" + "user.json",'utf8', function(err, data) {
		console.log(data);
		res.end(data);
		});
	});
}
