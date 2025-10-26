const { Subjects } = require("../../../interfaces/subjects");

/**
 * @type {import("express").RequestHandler}
 */
module.exports.GET = async (req, res) => {
	const subjects = new Subjects(res.app.locals.db);
	res.json(await subjects.list()).end();
};

/**
 * @type {import("express").RequestHandler}
 */
module.exports.POST = async (req, res) => {
	const subjects = new Subjects(res.app.locals.db);

	let c;
	try {
		c = await subjects.create(req.body);
	} catch (err) {
		console.error(err);
		if (err.name === "BadInputError") {
			return res.status(400).json({ error: err.message }).end();
		} else {
			throw err;
		}
	}
	res.json(c).end();
};
