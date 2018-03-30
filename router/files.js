module.exports = function(app, fs, jsonrpc, crypto) {

	var multer = require('multer');
	var path = require('path');
	var request = require('ajax-request');
	var url = require('url');

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
		  dest: "upload/",
		  limits: {
		  	fileSize: 50 * 1024 * 1024
		  }
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
								hashbuf = crypto.getHash(buf.toString());
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
				"getFilelist", ["1", "10"], req.session.jwt,
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


	app.post('/downloadFile', function(req, res) {
		var filename = req.body.download_filename;
		var originName = req.body.download_originName;
		var hash = req.body.download_hash;

		var filepath = __dirname + "/../upload/" + filename;

		console.log("filepath : " + filepath);

		var filebuf;

		try {
			filebuf = fs.readFileSync(filepath, 'utf8');
		} catch (err) {
		
			console.log("readFileSync error :" + err);

			if (err.code === 'ENOENT') {
				res.redirect(url.format({
						pathname: "/errAlert",
						query: {
							"msg": originName + " not found"	
						}
				}));
			} else {
				res.redirect(url.format({
					pathname: "/errAlert",
					query: {
						"msg": originName + " download error"	
					}
				}));
			}
		}

		var originHash = crypto.getHash(filebuf).toString();

		console.log("hash test : " + hash + " " + originHash);

		if (hash == originHash) {
			res.download( filepath, originName, function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log("download success");
				}
			});
		} else {
			res.redirect(url.format({
				pathname: "/errAlert",
				query: {
					"msg": originName + " is modified"	
				}
			}));
		}
	});

	app.get('/errAlert', function(req, res) {
		var msg = req.query.msg;

		res.set({ 'content-type': 'charset=utf-8' });
		res.end('<script>alert("' + msg + '"); location.href="/filelist";</script>');
	});
}
