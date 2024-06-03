export default function handler(req, res) {
	res.status(200).json({
		NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "NOT SET",
		GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "NOT SET",
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || "NOT SET",
	});
}
