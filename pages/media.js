import React from "react";
import Head from "next/head";
import { Film } from "lucide-react";

export default function Media() {
	return (
		<>
			<Head>
				<title>Media | Trick Book</title>
				<meta
					name="description"
					content="Share and discover skate videos on Trick Book"
				/>
			</Head>
			<div className="container mx-auto px-4 py-16 text-center">
				<Film className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
				<h1 className="text-4xl font-bold text-foreground mb-4">Media</h1>
				<p className="text-muted-foreground text-lg max-w-md mx-auto">
					Coming soon - Share and discover skate videos from the community.
				</p>
			</div>
		</>
	);
}
