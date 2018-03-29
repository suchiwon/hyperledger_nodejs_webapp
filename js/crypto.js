var crypto = require('crypto');

exports.getHash = function(str) {
	return crypto.createHash("sha256").update(str).digest("base64");
}
