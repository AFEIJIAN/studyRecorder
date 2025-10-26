const { Certifications } = require("../../../interfaces/certs");

/**
 * @type {import("express").RequestHandler}
 */
module.exports.GET = async (req, res) => {
	const certs = new Certifications(res.app.locals.db);
	let c = await certs.get(req.params.uuid);

	if (!c) {
		return res.status(404).json({ error: "Certification Not Found" }).end();
	} else {
		res.json(c).end();
	}
};

/**
 * @type {import("express").RequestHandler}
 */
module.exports.PATCH = async (req, res) => {
	const certs = new Certifications(res.app.locals.db);

	let c;
	try {
		c = await certs.update(req.params.uuid, req.body);
	} catch (err) {
		if (err.name === "BadInputError") {
			return res.status(400).json({ error: err.message }).end();
		} else if (err.name === "NotFoundError") {
			return res.status(400).json({ error: err.message }).end();
		} else {
			throw err;
		}
	}
	res.json(c).end();
};

/**
 * @type {import("express").RequestHandler}
 */
module.exports.DELETE = async (req, res) => {
	const certs = new Certifications(res.app.locals.db);

	try {
		await certs.delete(req.params.uuid);
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
