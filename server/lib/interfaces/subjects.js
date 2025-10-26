/**
 * @typedef {object} Includes
 * @property {string} name Include entity name
 * @property {import("sequelize").Order} order Sorting order for the entity
 */

const { Op } = require("sequelize");
const { BadInputError, NotFoundError } = require("./errors");
const { Certifications } = require("./certs");

class Subjects {
	/**
	 * @type {import("sequelize").Sequelize}
	 */
	#db;

	/**
	 * @type {Certifications}
	 */
	#certs;

	constructor(db) {
		this.#db = db;
		this.#certs = new Certifications(db);
	}

	/**
	 * Generate a sequelize query object that include all joins needed for ownership check
	 * @param {string} [certificationID] Certification ID
	 * @returns {import("sequelize").FindOptions}
	 */
	#getOpt(certificationID) {
		const certifications = this.#db.models["certifications"];

		/** @type {import("sequelize").FindOptions} */
		let opt = {
			where: {},
			include: [
				{
					model: certifications,
					as: "_cert",
					// must match to make sure users only can find subject belongs to the certs they owned
					required: true,
					where: {},
				},
			],
		};

		if (certificationID) opt.include.where.uuid = certificationID;
		return opt;
	}

	/**
	 * Return list of subjects active within the date provided
	 * @param {string} certificationID Certification ID
	 * @param {Date} [date] Date context, default to current datetime
	 * @param {boolean | string[] | Includes[]} [include] Whether to include nested entities: assignments, exams and quizzes
	 */
	async listActive(certificationID, date, include = false) {
		const subjects = this.#db.models["subjects"];

		const assignments = this.#db.models["assignments"];
		const exams = this.#db.models["exams"];
		const quizzes = this.#db.models["quizzes"];

		// TODO: put it into #getOpt
		/**
		 * @type {{ [key: string]: import("sequelize").Includeable }}
		 */
		const includes = {
			assignments: {
				model: assignments,
				as: "_assignments",
			},
			exams: {
				model: exams,
				as: "_exams",
			},
			quizzes: {
				model: quizzes,
				as: "_quizzes",
			},
		};

		if (Array.isArray(include)) {
			let invalid = include.filter((i) => {
				return typeof i === "object" ? !includes[i.name] : !includes[i];
			});
			if (invalid.length)
				throw new Error(`Invalid include type: ${invalid.join(", ")}`);
		}

		if (!date) date = new Date();

		if (!(date instanceof Date))
			throw new Error("Date context must be an instance of Date");
		if (isNaN(date.getDate()))
			throw new BadInputError("Invalid date value");

		let opt = this.#getOpt(certificationID);
		// NOTE: if there is no matches might be because end date is null
		opt.where = {
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

		if (Array.isArray(include)) {
			for (let i of include) {
				if (typeof i === "object") {
					let { name, order } = i;
					let o = Object.assign({}, includes[name]);

					if (Array.isArray(order)) {
						o.order = order;
						o.separate = true;
					}
					opt.include.push(o);
				} else {
					opt.include.push(includes[i]);
				}
			}
		} else if (!!include) {
			opt.include.push(...Object.keys(includes).map((t) => includes[t]));
		}

		let all = await subjects.findAll(opt);

		return all.map((o) => o.toJSON());
	}

	/**
	 * @param {string} certificationID Certification ID
	 * @param {boolean | string[]} [include] Whether to include nested entities: assignments, exams and quizzes
	 * @returns {Promise<any[]>}
	 */
	async list(certificationID, include = false) {
		const subjects = this.#db.models["subjects"];

		const assignments = this.#db.models["assignments"];
		const exams = this.#db.models["exams"];
		const quizzes = this.#db.models["quizzes"];

		/**
		 * @type {{ [key: string]: import("sequelize").Includeable }}
		 */
		const includes = {
			assignments: {
				model: assignments,
				as: "_assignments",
			},
			exams: {
				model: exams,
				as: "_exams",
			},
			quizzes: {
				model: quizzes,
				as: "_quizzes",
			},
		};

		if (Array.isArray(include)) {
			let invalid = include.filter((i) => {
				return typeof i === "object" ? !includes[i.name] : !includes[i];
			});
			if (invalid.length)
				throw new Error(`Invalid include type: ${invalid.join(", ")}`);
		}

		let opt = this.#getOpt(certificationID);

		if (Array.isArray(include)) {
			for (let i of include) {
				if (typeof i === "object") {
					let { name, order } = i;
					let o = Object.assign({}, includes[name]);

					if (Array.isArray(order)) {
						o.order = order;
						o.separate = true;
					}
				} else {
					opt.include.push(includes[i]);
				}
			}
		} else if (!!include) {
			opt.include.push(...Object.keys(includes).map((t) => includes[t]));
		}

		let all = await subjects.findAll(opt);

		return all.map((o) => o.toJSON());
	}

	/**
	 * @param {string} uuid Subject ID
	 * @param {boolean | string[]} [include] Whether to include nested entities: assignments, exams and quizzes
	 * provide an array to customize what to be included
	 * @returns {Promise<any | undefined>}
	 */
	async get(uuid, include = false) {
		const subjects = this.#db.models["subjects"];

		const assignments = this.#db.models["assignments"];
		const exams = this.#db.models["exams"];
		const quizzes = this.#db.models["quizzes"];

		/**
		 * @type {{ [key: string]: import("sequelize").Includeable }}
		 */
		const includes = {
			assignments: {
				model: assignments,
				as: "_assignments",
			},
			exams: {
				model: exams,
				as: "_exams",
			},
			quizzes: {
				model: quizzes,
				as: "_quizzes",
			},
		};

		if (Array.isArray(include)) {
			let invalid = include.filter((i) => !includes[i]);
			if (invalid.length)
				throw new Error(`Invalid include type: ${invalid.join(", ")}`);
		}

		if (!uuid) throw new BadInputError("Subject ID must not be empty");

		let opt = this.#getOpt();
		opt.where.uuid = uuid;

		if (Array.isArray(include)) {
			opt.include.push(...include.map((t) => includes[t]));
		} else if (!!include) {
			opt.include.push(...Object.keys(includes).map((t) => includes[t]));
		}

		return (await subjects.findOne(opt))?.toJSON();
	}

	/**
	 * @param {string} uuid Subject ID
	 * @returns {Promise<boolean>}
	 */
	async has(uuid) {
		const subjects = this.#db.models["subjects"];

		if (!uuid) throw new BadInputError("Subject ID must not be empty");

		let opt = this.#getOpt();
		opt.where.uuid = uuid;

		return (await subjects.count(opt)) !== 0;
	}

	/**
	 * @param {{ [field: string]: any }} details Subject details
	 * @returns {Promise<any>}
	 */
	async create(details) {
		const subjects = this.#db.models["subjects"];

		if (!details)
			throw new BadInputError("Please provide certification details");

		let { certificationID, name, start, end, remarks, completed } = details;

		if (!certificationID)
			throw new BadInputError("Certification must not be empty");

		let cert = await this.#certs.get(certificationID, uid);
		if (!cert) throw new BadInputError("Certification not found");

		if (!name) throw new BadInputError("Subject name must not be empty");
		if (!start || isNaN(Date.parse(start)))
			throw new BadInputError("Invalid subject start date");
		if (end && isNaN(Date.parse(end)))
			throw new BadInputError("Invalid subject end date");

		if (start && end && Date.parse(start) > Date.parse(end))
			throw new BadInputError(
				"Subject Start date must be earlier than End Date",
			);

		if (Date.parse(cert.start) > Date.parse(start))
			throw new BadInputError(
				"Subject Start Date must follow after Certification Start Date",
			);
		if (cert.end && Date.parse(start) > Date.parse(cert.end))
			throw new BadInputError(
				"Subject Start Date must before Certification End Date",
			);
		if (cert.end && Date.parse(end) > Date.parse(cert.end))
			throw new BadInputError(
				"Subject End Date must before Certification End Date",
			);

		return (
			await subjects.create({
				certificationID,
				name,
				start: new Date(start),
				end: end ? new Date(end) : undefined,
				remarks,
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
		const subjects = this.#db.models["subjects"];

		if (!uuid) throw new BadInputError("Subject ID must not be empty");
		if (!details)
			throw new BadInputError("Please provide certification details");

		let opt = this.#getOpt();
		opt.where.uuid = uuid;

		let match = await subjects.findOne(opt);
		if (!match) throw new NotFoundError("Subject not found", uuid);

		let { name, start, end, remarks, completed } = details;

		if (start && isNaN(Date.parse(start)))
			throw new BadInputError("Invalid subject start date");
		if (end && isNaN(Date.parse(end)))
			throw new BadInputError("Invalid subject end date");

		if (start || end) {
			let st = start ? new Date(start) : match.start;
			let ed = end ? new Date(end) : match.end;

			if (st && ed && st > ed)
				throw new BadInputError(
					"Subject Start date must be earlier than End Date",
				);

			if (Date.parse(match._cert.start) > Date.parse(st))
				throw new BadInputError(
					"Subject Start Date must follow after Certification Start Date",
				);

			if (
				match._cert.end &&
				st &&
				Date.parse(st) > Date.parse(match._cert.end)
			)
				throw new BadInputError(
					"Subject Start Date must before Certification End Date",
				);
			if (
				match._cert.end &&
				ed &&
				Date.parse(ed) > Date.parse(match._cert.end)
			)
				throw new BadInputError(
					"Subject End Date must before Certification End Date",
				);
		}

		if (start) match.start = new Date(start);
		if (end) match.end = new Date(end);
		if (name) match.name = name;
		if (remarks !== undefined) match.remarks = remarks;
		if (completed !== undefined) match.completed = !!completed;

		return (await match.save()).toJSON();
	}

	/**
	 * @param {string} uuid Subject ID to delete
	 * @returns {Promise<void>}
	 */
	async delete(uuid) {
		const subjects = this.#db.models["subjects"];

		if (!uuid) throw new BadInputError("Subject ID must not be empty");

		let opt = this.#getOpt();
		opt.where.uuid = uuid;

		let match = await subjects.findOne(opt);
		if (!match) throw new NotFoundError("Subject not found", uuid);

		return await match.destroy();
	}
}

module.exports.Subjects = Subjects;
