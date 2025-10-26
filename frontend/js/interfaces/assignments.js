class Assignments {
	async get(id) {
		let result;

		result = await fetch(`/api/assignment/${encodeURIComponent(id)}`);

		if (result.ok) return await result.json();

		switch (result.status) {
			case 404:
				return;

			case 500:
				throw new Error("Failed to get assignment, server error (500)");

			default:
				throw new Error(
					`Failed to get assignment, unexpected error (${result.status})`,
				);
		}
	}

	async list() {
		let result;

		result = await fetch("/api/assignments");

		if (result.ok) return await result.json();

		switch (result.status) {
			case 500:
				throw new Error(
					"Failed to get assignments, server error (500)",
				);

			default:
				throw new Error(
					`Failed to get assignments, unexpected error (${result.status})`,
				);
		}
	}

	async create(o) {
		if (typeof o !== "object")
			throw new Error("Assignment details must be an object");

		let result;

		result = await fetch("/api/assignments", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(o),
		});

		if (result.ok) return await result.json();

		switch (result.status) {
			case 400:
				let res = await result.json();
				throw new Error(res.error);

			case 500:
				throw new Error(
					"Failed to create assignment, server error (500)",
				);

			default:
				throw new Error(
					`Failed to create assignment, unexpected error (${result.status})`,
				);
		}
	}

	async update(id, o) {
		if (!id) throw new Error("Assignment ID must not be empty");
		if (typeof o !== "object")
			throw new Error("Assignment details must be an object");

		let result;

		result = await fetch(`/api/assignment/${encodeURIComponent(id)}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(o),
		});

		if (result.ok) return await result.json();

		switch (result.status) {
			case 404:
				var res = await result.json();
				throw new Error(res.error);

			case 400:
				var res = await result.json();
				throw new Error(res.error);

			case 500:
				throw new Error(
					"Failed to update assignment, server error (500)",
				);

			default:
				throw new Error(
					`Failed to update assignment, unexpected error (${result.status})`,
				);
		}
	}

	async delete(id) {
		if (!id) throw new Error("Assignment ID must not be empty");

		let result;

		result = await fetch(`/api/assignment/${encodeURIComponent(id)}`, {
			method: "DELETE",
		});

		if (result.ok) return;

		switch (result.status) {
			case 404:
				let res = await result.json();
				throw new Error(res.error);

			case 500:
				throw new Error(
					"Failed to delete assignment, server error (500)",
				);

			default:
				throw new Error(
					`Failed to delete assignment, unexpected error (${result.status})`,
				);
		}
	}
}
