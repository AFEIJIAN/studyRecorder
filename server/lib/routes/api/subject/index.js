const { Subjects } = require("../../../interfaces/subjects");

/**
 * @type {import("express").RequestHandler}
 */
module.exports.GET = async (req, res) => {
	const subjects = new Subjects(res.app.locals.db);
	let s = await subjects.get(req.params.uuid);

	if (!s) {
		return res.status(404).json({ error: "Subject Not Found" }).end();
	} else {
		res.json(s).end();
	}
};

/**
 * @type {import("express").RequestHandler}
 */
module.exports.PATCH = async (req, res) => {
	const subjects = new Subjects(res.app.locals.db);

	let s;
	try {
		s = await subjects.update(
			req.params.uuid,
			req.body,
			res.locals.user.uuid,
		);
	} catch (err) {
		if (err.name === "BadInputError") {
			return res.status(400).json({ error: err.message }).end();
		} else if (err.name === "NotFoundError") {
			return res.status(400).json({ error: err.message }).end();
		} else {
			throw err;
		}
	}
	res.json(s).end();
};

/**
 * @type {import("express").RequestHandler}
 */
module.exports.DELETE = async (req, res) => {
	const subjects = new Subjects(res.app.locals.db);

	try {
		await subjects.delete(req.params.uuid);
	} catch (err) {
		if (err.name === "BadInputError") {
			return res.status(400).json({ error: err.message }).end();
		} else if (err.name === "NotFoundError") {
			return res.status(404).json({ error: err.message }).end();
		} else {
			throw err;
		}
	}
	res.sendStatus(204).end();
};
