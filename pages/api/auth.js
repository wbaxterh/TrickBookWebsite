// pages/api/auth.js
import fetch from "isomorphic-unfetch";

export default async function handler(req, res) {
	if (req.method === "POST") {
		const { email, password } = req.body;
		try {
			// Forward the request to your existing Express.js backend
			const response = await fetch("http://localhost:9000/api/auth", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await response.json();

			if (response.ok) {
				// Handle successful login
				// For example, store the token and redirect to profile page
				res.setHeader("Set-Cookie", `token=${data.token}; HttpOnly; Path=/;`);
				res.status(200);
				res.send(data);
			} else {
				// Handle error message
				console.error("Invalid login:", data.error);
				res.status(400);
				res.send(data);
			}
		} catch (error) {
			console.error("An error occurred:", error);
		}
	} else {
		res.status(405).end(); // Method not allowed
	}
}
