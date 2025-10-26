const { Op } = require("sequelize");
const { BadInputError, NotFoundError } = require("./errors");

class Certifications {
	/**
	 * @type {import("sequelize").Sequelize}
	 */
	#db;

	constructor(db) {
		this.#db = db;
	}

	/**
	 * Return list of certifications active within the date provided
	 * @param {Date} [date] Date context, default to current datetime
	 */
	async listActive(date) {
		const certs = this.#db.models["certifications"];

		if (!date) date = new Date();

		if (!(date instanceof Date))
			throw new Error("Date context must be an instance of Date");
		if (isNaN(date.getDate()))
			throw new BadInputError("Invalid date value");

		// NOTE: if there is no matches might be because end date is null
		let opt = {
			where: {
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
			},
		};

		let all = await certs.findAll(opt);

		return all.map((o) => o.toJSON());
	}

	/**
	 * @returns {Promise<any[]>}
	 */
	async list() {
		const certifications = this.#db.models["certifications"];

		let all = await certifications.findAll();

		return all.map((o) => o.toJSON());
	}

	/**
	 * @param {string} uuid Certification ID
	 * @param {boolean} include Whether to include subjects
	 * @returns {Promise<any | undefined>}
	 */
	async get(uuid, include = false) {
		const certifications = this.#db.models["certifications"];
		const subjects = this.#db.models["subjects"];

		if (!uuid)
			throw new BadInputError("Certification ID must not be empty");

		/** @type {import("sequelize").FindOptions} */
		let opt = { where: { uuid } };

		if (include) {
			opt.include = {
				model: subjects,
				as: "_subjects",
			};
		}

		return (await certifications.findOne(opt))?.toJSON();
	}

	/**
	 * @param {string} uuid Certification ID
	 * @returns {Promise<boolean>}
	 */
	async has(uuid) {
		const certifications = this.#db.models["certifications"];

		if (!uuid)
			throw new BadInputError("Certification ID must not be empty");

		return (await certifications.count({ where: { uuid } })) !== 0;
	}

	/**
	 * @param {{ [field: string]: any }} details Certification details
	 * @returns {Promise<any>}
	 */
	async create(details) {
		const certifications = this.#db.models["certifications"];

		if (!details)
			throw new BadInputError("Please provide certification details");

		let { name, institution, start, end, completed } = details;

		if (!name)
			throw new BadInputError("Certification name must not be empty");
		if (!institution)
			throw new BadInputError("Institution name must not be empty");
		if (!start || isNaN(Date.parse(start)))
			throw new BadInputError(
				"Invalid Certification enrollment/start date",
			);
		if (end && isNaN(Date.parse(end)))
			throw new BadInputError(
				"Invalid Certification graduation/end date",
			);

		return (
			await certifications.create({
				name,
				institution,
				start: new Date(start),
				end: end ? new Date(end) : undefined,
			})
		).toJSON();
	}

	/**
	 * @param {string} uuid Certification ID
	 * @param {{ [field: string]: any }} details New certification details to overwrite
	 * @returns {Promise<any>}
	 */
	async update(uuid, details) {
		const certifications = this.#db.models["certifications"];

		if (!uuid)
			throw new BadInputError("Certification ID must not be empty");
		if (!details)
			throw new BadInputError("Please provide certification details");

		let match = await certifications.findOne({ where: { uuid } });

		if (!match) throw new NotFoundError("Certification not found", uuid);

		let { name, institution, start, end, completed } = details;

		if (start && isNaN(Date.parse(start)))
			throw new BadInputError(
				"Invalid Certification enrollment/start date",
			);
		if (end && isNaN(Date.parse(end)))
			throw new BadInputError(
				"Invalid Certification graduation/end date",
			);

		if (start || end) {
			let st = start ? new Date(start) : match.start;
			let ed = end ? new Date(end) : match.end;

			if (st && ed && st > ed)
				throw new BadInputError(
					"Subject Start date must be earlier than End Date",
				);
		}

		if (name) match.name = name;
		if (institution) match.institution = institution;
		if (start) match.start = new Date(start);
		if (end) match.end = new Date(end);

		await match.save();
		return match.toJSON();
	}

	/**
	 * @param {string} uuid Certification ID to delete
	 * @returns {Promise<void>}
	 */
	async delete(uuid) {
		const certifications = this.#db.models["certifications"];

		if (!uuid)
			throw new BadInputError("Certification ID must not be empty");

		let o = await certifications.findOne({ where: { uuid } });

		if (!o) throw new NotFoundError("Certification not found", uuid);

		return await o.destroy();
	}
}

module.exports.Certifications = Certifications;
