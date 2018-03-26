module.exports = function(app, fs, jsonrpc) {

	var multer = require('multer');
	var path = require('path');
	var request = require('ajax-request');

	var crypto = require('crypto');

	const url_host = "http://localhost:4000/";

	let storage = multer.diskStorage({
		destination: function(req, file, callback) {
			callback(null, "uploads/");
		},
		filename: function(req, file, callback) {
			let extension = path.extname(file.originalname);
			let basename = path.basename(file.originalname, extension);
			callback(null, basename + "-" + Date.now() + extension);
		}
	});

	let upload = multer({
		//storage: storage
		  dest: "upload/" 
	}).single("user_file");

	app.post('/uploadFile', upload, function (req, res) {

		upload(req, res, function(err) {
			if (err) {
				console.log('error while uploading file: ' + err);
			} else {
			
				var buf = new Buffer(req.file.size);

				var hashbuf;

				fs.open(req.file.path, 'r', function(err, fd) {
					if (!err) {
						fs.read(fd, buf, 0, req.file.size, 0, function(err) {
							if (!err) {
								hashbuf = crypto.createHash("sha256").update(buf.toString()).digest("base64");
								console.log(hashbuf.toString());

								var JSONdata = jsonrpc.makeJSONdata("upload", 
										[req.file.filename, req.file.originalname, req.session.username, hashbuf.toString()]);

								jsonrpc.executeJsonRpc (request, "POST", "channels/mychannel/chaincodes/files",
										"upload", 
										[req.file.filename, req.file.originalname, req.session.username, hashbuf.toString()], req.session.jwt,
										function success(data) {
											console.log("uploaded file: " + req.file.toString());
										},
										function error(data) {
											console.log("upload file to blockchain error: " + data);
								});
							} else {
								console.log("fs read error");
							}
						});
					} else {
						console.log("fs open error");
					}
				});
					console.log(req.file);
				}	
			});

		res.redirect("/filelist");
	});

	app.get('/getFilelist/:pageIndex', function (req, res) {
		
		var JSONdata = jsonrpc.makeJSONdata("getFilelist", ["1", "10"]);

		/*
		var JSONdata = {
			peer: "peer0.org1.example.com",
			fcn: "getFilelist",
			args: ["1","6"]
		}
		*/

		jsonrpc.executeJsonRpc(request, "GET", "channels/mychannel/chaincodes/files",
				"getFilelist", ["1", "6"], req.session.jwt,
				function success(data) {
					console.log("getFilelist");
					console.log(data);
					res.writeHead(200, {'Content-Type': 'charset=utf-8'});
					res.end(data);
				},
				function error(data) {
					res.end("getFilelist error");
				});
	});
}
