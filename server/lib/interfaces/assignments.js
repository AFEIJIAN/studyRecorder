const { Op } = require("sequelize");
const { BadInputError, NotFoundError } = require("./errors");
const { Subjects } = require("./subjects");

class Assignments {
	/**
	 * @type {import("sequelize").Sequelize}
	 */
	#db;

	/**
	 * @type {Subjects}
	 */
	#subjects;

	constructor(db) {
		this.#db = db;
		this.#subjects = new Subjects(db);
	}

	/**
	 * Generate a sequelize query object that include all joins needed for ownership check
	 * @param {string} [subjectID] Subject ID
	 * @param {string} [certificationID] Certification ID
	 * @returns {import("sequelize").FindOptions}
	 */
	#getOpt(subjectID, certificationID) {
		const subjects = this.#db.models["subjects"];
		const certifications = this.#db.models["certifications"];

		/** @type {import("sequelize").FindOptions} */
		let opt = {
			where: {},
			include: {
				model: subjects,
				as: "_subject",
				required: true,
				where: {},
				include: [
					{
						model: certifications,
						as: "_cert",
						required: true,
					},
				],
			},
		};

		if (subjectID) opt.include.where.uuid = subjectID;
		// TODO: certification ID filter is not required because each subject only ties to a certification
		if (certificationID)
			opt.include.include[0].where.uuid = certificationID;

		return opt;
	}

	/**
	 * Return list of all assignments of all active subjects within the date provided
	 * @param {string} subjectID Subject ID
	 * @param {string} certificationID Certification ID
	 * @param {Date} [date] Date context, default to current datetime
	 * @param {import("sequelize").Order} [order] Order/sorting option to pass over
	 */
	async listActive(subjectID, certificationID, date, order = []) {
		const assignments = this.#db.models["assignments"];

		if (!date) date = new Date();

		if (!(date instanceof Date))
			throw new Error("Date context must be an instance of Date");
		if (isNaN(date.getDate()))
			throw new BadInputError("Invalid date value");

		let opt = this.#getOpt(certificationID);
		// NOTE: if there is no matches might be because end date is null
		opt.include.where = {
			[Op.and]: [
				{
					start: { [Op.lte]: date },
				},
				{
					end: {
						[Op.or]: {
							[Op.gte]: date,
							[Op.is]: null,
						},
					},
				},
			],
		};

		if (subjectID) opt.include.where.uuid = subjectID;

		if (Array.isArray(order)) opt.order = order;

		let all = await assignments.findAll(opt);

		return all.map((o) => o.toJSON());
	}

	/**
	 * @param {string} subjectID Subject ID
	 * @param {string} certificationID Certification ID
	 * @param {import("sequelize").Order} [order] Order/sorting option to pass over
	 * @returns {Promise<any[]>}
	 */
	async list(subjectID, certificationID, order = []) {
		const assignments = this.#db.models["assignments"];

		let opt = this.#getOpt(subjectID, certificationID);
		if (Array.isArray(order)) opt.order = order;

		let all = await assignments.findAll(opt);

		return all.map((o) => o.toJSON());
	}

	/**
	 * @param {string} uuid Assignment ID
	 * @returns {Promise<any | undefined>}
	 */
	async get(uuid) {
		const assignments = this.#db.models["assignments"];

		if (!uuid) throw new BadInputError("Assignment ID must not be empty");

		let opt = this.#getOpt();
		opt.where.uuid = uuid;

		return (await assignments.findOne(opt))?.toJSON();
	}

	/**
	 * @param {string} uuid Assignment ID
	 * @returns {Promise<boolean>}
	 */
	async has(uuid) {
		const assignments = this.#db.models["assignments"];

		if (!uuid) throw new BadInputError("Assignment ID must not be empty");

		let opt = this.#getOpt();
		opt.where.uuid = uuid;

		return (await assignments.count(opt)) !== 0;
	}

	/**
	 * @param {{ [field: string]: any }} details Subject details
	 * @returns {Promise<any>}
	 */
	async create(details) {
		const assignments = this.#db.models["assignments"];

		if (!details)
			throw new BadInputError("Please provide assignment details");

		let { subjectID, name, expiry, completed } = details;

		if (!subjectID) throw new BadInputError("Subject must not be empty");
		if (!(await this.#subjects.has(subjectID)))
			throw new BadInputError("Subject not found");

		if (!name) throw new BadInputError("Assignment name must not be empty");
		if (!expiry || isNaN(Date.parse(expiry)))
			throw new BadInputError("Invalid assignment deadline");

		return (
			await assignments.create({
				subjectID,
				name,
				expiry: new Date(expiry),
				completed: !!completed,
			})
		).toJSON();
	}

	/**
	 * @param {string} uuid Subject ID
	 * @param {{ [field: string]: any }} details New subject details to overwrite
	 * @returns {Promise<any>}
	 */
	async update(uuid, details) {
		const assignments = this.#db.models["assignments"];

		if (!uuid) throw new BadInputError("Assignment ID must not be empty");
		if (!details)
			throw new BadInputError("Please provide assignment details");

		let opt = this.#getOpt();
		opt.where.uuid = uuid;

		let match = await assignments.findOne(opt);
		if (!match) throw new NotFoundError("Assignment not found", uuid);

		let { name, expiry, completed } = details;

		// TODO: make sure expiry must be within subject date range

		if (isNaN(Date.parse(expiry)))
			throw new BadInputError("Invalid assignment deadline");

		if (expiry) match.expiry = new Date(expiry);
		if (name) match.name = name;
		if (completed !== undefined) match.completed = !!completed;

		return (await match.save()).toJSON();
	}

	/**
	 * @param {string} uuid Subject ID to delete
	 * @returns {Promise<void>}
	 */
	async delete(uuid) {
		const assignments = this.#db.models["assignments"];

		if (!uuid) throw new BadInputError("Assignment ID must not be empty");

		let opt = this.#getOpt();
		opt.where.uuid = uuid;

		let match = await assignments.findOne(opt);
		if (!match) throw new NotFoundError("Assignment not found", uuid);

		return await match.destroy();
	}
}

module.exports.Assignments = Assignments;
