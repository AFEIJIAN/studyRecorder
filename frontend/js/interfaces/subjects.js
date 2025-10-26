class Subjects {
	async get(id) {
		let result;

		result = await fetch(`/api/subject/${encodeURIComponent(id)}`);

		if (result.ok) return await result.json();

		switch (result.status) {
			case 404:
				return;

			case 500:
				throw new Error("Failed to get subject, server error (500)");

			default:
				throw new Error(
					`Failed to get subject, unexpected error (${result.status})`,
				);
		}
	}

	async list() {
		let result;

		result = await fetch("/api/subjects");

		if (result.ok) return await result.json();

		switch (result.status) {
			case 500:
				throw new Error("Failed to get subjects, server error (500)");

			default:
				throw new Error(
					`Failed to get subjects, unexpected error (${result.status})`,
				);
		}
	}

	async create(o) {
		if (typeof o !== "object")
			throw new Error("Subject details must be an object");

		let result;

		result = await fetch("/api/subjects", {
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
				throw new Error("Failed to create subject, server error (500)");

			default:
				throw new Error(
					`Failed to create subject, unexpected error (${result.status})`,
				);
		}
	}

	async update(id, o) {
		if (!id) throw new Error("Subject ID must not be empty");
		if (typeof o !== "object")
			throw new Error("Subject details must be an object");

		let result;

		result = await fetch(`/api/subject/${encodeURIComponent(id)}`, {
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
				throw new Error("Failed to update subject, server error (500)");

			default:
				throw new Error(
					`Failed to update subject, unexpected error (${result.status})`,
				);
		}
	}

	async delete(id) {
		if (!id) throw new Error("Subject ID must not be empty");

		let result;

		result = await fetch(`/api/subject/${encodeURIComponent(id)}`, {
			method: "DELETE",
		});

		if (result.ok) return;

		switch (result.status) {
			case 404:
				let res = await result.json();
				throw new Error(res.error);

			case 500:
				throw new Error("Failed to delete subject, server error (500)");

			default:
				throw new Error(
					`Failed to delete subject, unexpected error (${result.status})`,
				);
		}
	}
}
