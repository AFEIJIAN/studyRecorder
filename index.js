const path = require("path");
const express = require("express");

const { initDB } = require("./server/lib/db");

initDB().then(async (db) => {
	const app = express();

	app.use(express.json());

	app.locals.db = db;

	app.get(
		"/api/certifications",
		require("./server/lib/routes/api/certifications").GET,
	);
	app.post(
		"/api/certifications",
		require("./server/lib/routes/api/certifications").POST,
	);

	app.get(
		"/api/certification/:uuid",
		require("./server/lib/routes/api/certification").GET,
	);
	app.patch(
		"/api/certification/:uuid",
		require("./server/lib/routes/api/certification").PATCH,
	);
	app.delete(
		"/api/certification/:uuid",
		require("./server/lib/routes/api/certification").DELETE,
	);

	app.get("/api/subjects", require("./server/lib/routes/api/subjects").GET);
	app.post("/api/subjects", require("./server/lib/routes/api/subjects").POST);

	app.get(
		"/api/subject/:uuid",
		require("./server/lib/routes/api/subject").GET,
	);
	app.patch(
		"/api/subject/:uuid",
		require("./server/lib/routes/api/subject").PATCH,
	);

	app.delete(
		"/api/subject/:uuid",
		require("./server/lib/routes/api/subject").DELETE,
	);

	app.get(
		"/api/assignments",
		require("./server/lib/routes/api/assignments").GET,
	);
	app.post(
		"/api/assignments",
		require("./server/lib/routes/api/assignments").POST,
	);

	app.get(
		"/api/assignment/:uuid",
		require("./server/lib/routes/api/assignment").GET,
	);
	app.patch(
		"/api/assignment/:uuid",
		require("./server/lib/routes/api/assignment").PATCH,
	);
	app.delete(
		"/api/assignment/:uuid",
		require("./server/lib/routes/api/assignment").DELETE,
	);

	// must be last to call
	app.use("/", express.static(path.join(__dirname, "frontend")));

	app.listen(process.env["HTTP_PORT"] || 3000);
	console.log(`Listening on 0.0.0.0:${process.env["HTTP_PORT"] || 3000}`);
});
