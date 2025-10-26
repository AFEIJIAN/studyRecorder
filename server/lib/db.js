const path = require("path");
const process = require("process");
const { DataTypes, Sequelize } = require("sequelize");

async function initDB() {
	const db = new Sequelize({
		dialect: "sqlite",
		storage: path.join(process.cwd(), "data.db"),
	});

	const certs = db.define("certifications", {
		uuid: {
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING(3000),
			allowNull: false,
		},
		institution: {
			type: DataTypes.TEXT,
			allowNull: false,
		},
		start: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		end: {
			type: DataTypes.DATEONLY,
		},
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	});

	const subjects = db.define("subjects", {
		uuid: {
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		certificationID: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: certs,
				key: "uuid",
			},
		},
		name: {
			type: DataTypes.STRING(3000),
			allowNull: false,
		},
		start: {
			type: DataTypes.DATEONLY,
			allowNull: false,
			defaultValue: DataTypes.NOW,
		},
		end: {
			type: DataTypes.DATEONLY,
		},
		remarks: DataTypes.STRING(300),
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	});

	certs.hasMany(subjects, {
		as: "_subjects",
		foreignKey: "certificationID",
		sourceKey: "uuid",
	});
	subjects.belongsTo(certs, {
		as: "_cert",
		foreignKey: "certificationID",
		targetKey: "uuid",
		onDelete: "CASCADE",
	});

	const assignments = db.define("assignments", {
		uuid: {
			type: DataTypes.UUID,
			allowNull: false,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		subjectID: {
			type: DataTypes.UUID,
			allowNull: false,
			references: {
				model: subjects,
				key: "uuid",
			},
		},
		name: {
			type: DataTypes.STRING(3000),
			allowNull: false,
		},
		expiry: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		completed: {
			type: DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	});

	subjects.hasMany(assignments, {
		as: "_assignments",
		foreignKey: "subjectID",
		sourceKey: "uuid",
	});
	assignments.belongsTo(subjects, {
		as: "_subject",
		foreignKey: "subjectID",
		targetKey: "uuid",
		onDelete: "CASCADE",
	});

	return await db.sync();
}

module.exports.initDB = initDB;
