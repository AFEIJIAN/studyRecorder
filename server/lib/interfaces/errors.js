class BadInputError extends Error {
	constructor(message) {
		super(message);
		this.name = "BadInputError";
		this.message = message;
	}
}

class NotFoundError extends Error {
	constructor(message, recordID) {
		super(message);
		this.name = "NotFoundError";
		this.message = message;
		this.uuid = recordID;
	}
}

module.exports.BadInputError = BadInputError;
module.exports.NotFoundError = NotFoundError;
