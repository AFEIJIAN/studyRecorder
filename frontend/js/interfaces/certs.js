class Certifications {
	async get(id) {
		let result;

		result = await fetch(`/api/certification/${encodeURIComponent(id)}`);

		if (result.ok) return await result.json();

		switch (result.status) {
			case 404:
				return;

			case 500:
				throw new Error(
					"Failed to get certification, server error (500)",
				);

			default:
				throw new Error(
					`Failed to get certification, unexpected error (${result.status})`,
				);
		}
	}

	async list() {
		let result;

		result = await fetch("/api/certifications");

		if (result.ok) return await result.json();

		switch (result.status) {
			case 500:
				throw new Error(
					"Failed to get certifications, server error (500)",
				);

			default:
				throw new Error(
					`Failed to get certifications, unexpected error (${result.status})`,
				);
		}
	}

	async create(o) {
		if (typeof o !== "object")
			throw new Error("Certification details must be an object");

		let result;

		result = await fetch("/api/certifications", {
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
					"Failed to create certification, server error (500)",
				);

			default:
				throw new Error(
					`Failed to create certification, unexpected error (${result.status})`,
				);
		}
	}

	async update(id, o) {
		if (!id) throw new Error("Certification ID must not be empty");
		if (typeof o !== "object")
			throw new Error("Certification details must be an object");

		let result;

		result = await fetch(`/api/certification/${encodeURIComponent(id)}`, {
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
					"Failed to update certification, server error (500)",
				);

			default:
				throw new Error(
					`Failed to update certification, unexpected error (${result.status})`,
				);
		}
	}

	async delete(id) {
		if (!id) throw new Error("Certification ID must not be empty");

		let result;

		result = await fetch(`/api/certification/${encodeURIComponent(id)}`, {
			method: "DELETE",
		});

		if (result.ok) return;

		switch (result.status) {
			case 404:
				let res = await result.json();
				throw new Error(res.error);

			case 500:
				throw new Error(
					"Failed to delete certification, server error (500)",
				);

			default:
				throw new Error(
					`Failed to delete certification, unexpected error (${result.status})`,
				);
		}
	}
}
