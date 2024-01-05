import axios from "axios";

export default async function handler(req, res) {
	if (req.method === "POST") {
		const { email, password } = req.body;
		console.log("request == ", JSON.stringify({ email, password }));
		console.log("Base URL:", process.env.NEXT_PUBLIC_BASE_URL);

		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9000";

		try {
			// Forward the request to your existing Express.js backend
			const axiosResponse = await axios.post(`${baseUrl}/api/auth`, {
				email,
				password,
			});

			const data = axiosResponse.data;
			console.log("Raw response:", data);

			// Handle successful login
			res.setHeader("Set-Cookie", `token=${data.token}; HttpOnly; Path=/;`);
			res.status(200).send(data);
		} catch (error) {
			// Handle error message
			console.error(
				"Invalid login:",
				error.response ? error.response.data : error.message
			);
			res
				.status(error.response ? error.response.status : 500)
				.send(
					error.response ? error.response.data : { error: "An error occurred" }
				);
		}
	} else {
		res.status(405).end(); // Method not allowed
	}
}
