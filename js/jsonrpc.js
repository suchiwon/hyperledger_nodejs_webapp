exports.makeJSONdata = function (func, args) {
	var JSONdata = {
		peers: ["peer0.org1.example.com","peer1.org1.example.com"],
		peer: "peer0.org1.example.com",
		fcn: func,
		args: args
	}

	return JSONdata;
}

exports.executeJsonRpc = function (request, url_type, url_exec, func, args, jwt, success, error) {

		console.log(JSON.stringify(JSONdata));

		const url_host = "http://localhost:4000/";

		var JSONdata = {
			peers: ["peer0.org1.example.com","peer1.org1.example.com"],
			peer: "peer0.org1.example.com",
			fcn: func,
			args: args
		}

		request({
			method: url_type,
			url: url_host + url_exec,
			data: JSONdata,
			encoding: 'utf-8',
			headers: {
				"Authorization": "Bearer " + jwt
			}
		}, function (err, response, body) {
			if (!err) {
				success(body);
			} else {
				console.log(err);
				error(body);
			}
		});
}
