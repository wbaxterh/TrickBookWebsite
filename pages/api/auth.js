// pages/api/auth.js
import fetch from "isomorphic-unfetch";

export default async function handler(req, res) {
	if (req.method === "POST") {
		const { email, password } = req.body;
		console.log(req.body);
		try {
			// Forward the request to your existing Express.js backend
			const response = await fetch("http://localhost:9000/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (response.ok) {
				// Handle success (store token, etc.)
				res.status(200).json(data);
			} else {
				// Forward any errors
				res.status(response.status).json(data);
			}
		} catch (error) {
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		res.status(405).end(); // Method not allowed
	}
}
