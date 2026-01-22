// next.config.js
module.exports = {
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "trickbook.s3.amazonaws.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "*.s3.amazonaws.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "s3.amazonaws.com",
				pathname: "/trickbook/**",
			},
			{
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "*.bunny.net",
				pathname: "/**",
			},
			{
				protocol: "https",
				hostname: "*.b-cdn.net",
				pathname: "/**",
			},
		],
	},
};
