import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Separator } from "./ui/separator";
import { Instagram, Youtube } from "lucide-react";

// X (formerly Twitter) icon component
const XIcon = ({ className }) => (
	<svg
		viewBox="0 0 24 24"
		className={className}
		fill="currentColor"
		aria-hidden="true"
	>
		<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
	</svg>
);

function Footer() {
	return (
		<footer className="bg-card border-t border-border">
			<div className="container mx-auto px-4 py-12">
				{/* Main Footer Content */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
					{/* Brand Section */}
					<div className="lg:col-span-1">
						<Link href="/" className="flex items-center gap-2 mb-4">
							<Image
								src="/adaptive-icon.png"
								height={40}
								width={40}
								alt="Trick Book"
							/>
							<span className="font-bold text-xl text-foreground">
								Trick Book
							</span>
						</Link>
						<p className="text-sm text-muted-foreground">
							Track your tricks, discover spots, and connect with fellow riders.
						</p>
					</div>

					{/* Explore Links */}
					<div>
						<h3 className="font-semibold text-foreground mb-4">Explore</h3>
						<ul className="space-y-3">
							<li>
								<Link
									href="/trickbook"
									className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
								>
									TrickBook
								</Link>
							</li>
							<li>
								<Link
									href="/spots"
									className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
								>
									Spots
								</Link>
							</li>
							<li>
								<Link
									href="/homies"
									className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
								>
									Homies
								</Link>
							</li>
							<li>
								<Link
									href="/media"
									className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
								>
									Media
								</Link>
							</li>
						</ul>
					</div>

					{/* Resources Links */}
					<div>
						<h3 className="font-semibold text-foreground mb-4">Resources</h3>
						<ul className="space-y-3">
							<li>
								<Link
									href="/blog"
									className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
								>
									Blog
								</Link>
							</li>
							<li>
								<Link
									href="/about"
									className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
								>
									About
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
								>
									Contact & Feedback
								</Link>
							</li>
							<li>
								<Link
									href="/privacy-policy"
									className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href="/terms-conditions"
									className="text-sm text-muted-foreground hover:text-yellow-500 transition-colors"
								>
									Terms & Conditions
								</Link>
							</li>
						</ul>
					</div>

					{/* Social Links */}
					<div>
						<h3 className="font-semibold text-foreground mb-4">Connect</h3>
						<div className="flex gap-4">
							<Link
								href="https://instagram.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-yellow-500 transition-colors"
								aria-label="Instagram"
							>
								<Instagram className="h-5 w-5" />
							</Link>
							<Link
								href="https://x.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-yellow-500 transition-colors"
								aria-label="X"
							>
								<XIcon className="h-5 w-5" />
							</Link>
							<Link
								href="https://youtube.com"
								target="_blank"
								rel="noopener noreferrer"
								className="text-muted-foreground hover:text-yellow-500 transition-colors"
								aria-label="YouTube"
							>
								<Youtube className="h-5 w-5" />
							</Link>
						</div>
						<p className="text-sm text-muted-foreground mt-4">
							Follow us for the latest updates and action sports content.
						</p>
					</div>
				</div>

				{/* Bottom Section */}
				<Separator className="my-8" />
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					<p className="text-sm text-muted-foreground">
						© 2026 The Trick Book. All rights reserved.
					</p>
					<div className="flex gap-6">
						<Link
							href="/privacy-policy"
							className="text-xs text-muted-foreground hover:text-yellow-500 transition-colors"
						>
							Privacy
						</Link>
						<Link
							href="/terms-conditions"
							className="text-xs text-muted-foreground hover:text-yellow-500 transition-colors"
						>
							Terms
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
