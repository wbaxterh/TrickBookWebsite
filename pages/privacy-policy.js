import Link from "next/link";
import Head from "next/head";
import Header from "../components/Header";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import {
	Shield,
	Lock,
	Eye,
	Database,
	Mail,
	ArrowLeft,
	CheckCircle,
	XCircle,
	Server,
	Key,
	UserX,
	Trash2
} from "lucide-react";

export default function PrivacyPolicy() {
	return (
		<>
			<Head>
				<title>Privacy Policy | TrickBook</title>
				<link rel="icon" href="/favicon.png" />
				<meta
					name="description"
					content="TrickBook Privacy Policy - Your data belongs to you. We never sell, share, or monetize your personal information."
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="index, follow" />
				<link rel="canonical" href="https://thetrickbook.com/privacy-policy" />
			</Head>
			<Header />

			<div className="min-h-screen bg-background py-12 px-4">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="text-center mb-12">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-500/20 mb-4">
							<Shield className="h-8 w-8 text-yellow-500" />
						</div>
						<h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
						<p className="text-muted-foreground">
							Last updated: January 21, 2025
						</p>
					</div>

					{/* Privacy Promise Banner */}
					<Card className="border-yellow-500/50 bg-yellow-500/5 mb-8">
						<CardContent className="pt-6">
							<h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
								<Lock className="h-5 w-5 text-yellow-500" />
								Our Privacy Promise
							</h2>
							<p className="text-muted-foreground mb-4">
								TrickBook is built by skaters, for skaters. We believe your personal data belongs to
								<strong className="text-foreground"> you</strong>, not advertisers. Unlike big tech platforms that
								profit from your information, we take a radically different approach:
							</p>
							<div className="grid md:grid-cols-2 gap-4">
								<div className="flex items-start gap-3">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span className="text-sm text-foreground">We <strong>never sell</strong> your data to anyone</span>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span className="text-sm text-foreground">We <strong>never share</strong> data with advertisers</span>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span className="text-sm text-foreground"><strong>No tracking pixels</strong> or third-party analytics</span>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span className="text-sm text-foreground"><strong>No behavioral profiling</strong> or ad targeting</span>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span className="text-sm text-foreground"><strong>End-to-end encryption</strong> for messages</span>
								</div>
								<div className="flex items-start gap-3">
									<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
									<span className="text-sm text-foreground"><strong>Delete your data</strong> anytime, completely</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Main Content */}
					<div className="space-y-8">
						{/* Section 1 */}
						<Card className="border-border">
							<CardContent className="pt-6">
								<h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
									<Database className="h-5 w-5 text-yellow-500" />
									1. Information We Collect
								</h2>
								<p className="text-muted-foreground mb-4">
									We collect only the minimum information necessary to provide you with a great experience.
									Here's exactly what we collect and why:
								</p>

								<div className="space-y-4">
									<div className="border-l-2 border-yellow-500 pl-4">
										<h3 className="font-semibold text-foreground">Account Information</h3>
										<ul className="text-sm text-muted-foreground mt-2 space-y-1">
											<li>• <strong>Email address</strong> - For account login and password recovery only</li>
											<li>• <strong>Username</strong> - Your public display name in the community</li>
											<li>• <strong>Password</strong> - Stored using industry-standard bcrypt hashing (we never see your actual password)</li>
											<li>• <strong>Profile picture</strong> - Optional, only if you choose to upload one</li>
										</ul>
									</div>

									<div className="border-l-2 border-yellow-500 pl-4">
										<h3 className="font-semibold text-foreground">Content You Create</h3>
										<ul className="text-sm text-muted-foreground mt-2 space-y-1">
											<li>• <strong>Progress entries</strong> - Your personal trick progress and session logs</li>
											<li>• <strong>Feed posts</strong> - Photos and videos you share with the community</li>
											<li>• <strong>Comments</strong> - Your interactions on other users' posts</li>
											<li>• <strong>Direct messages</strong> - Private conversations with your homies</li>
											<li>• <strong>Spot submissions</strong> - Skate spots you contribute to the community</li>
										</ul>
									</div>

									<div className="border-l-2 border-yellow-500 pl-4">
										<h3 className="font-semibold text-foreground">What We DON'T Collect</h3>
										<ul className="text-sm text-muted-foreground mt-2 space-y-1">
											<li>• <XCircle className="h-4 w-4 text-red-500 inline mr-1" />Your precise location (spots use city-level only)</li>
											<li>• <XCircle className="h-4 w-4 text-red-500 inline mr-1" />Your contacts or phone number</li>
											<li>• <XCircle className="h-4 w-4 text-red-500 inline mr-1" />Your browsing history outside TrickBook</li>
											<li>• <XCircle className="h-4 w-4 text-red-500 inline mr-1" />Biometric data or face recognition</li>
											<li>• <XCircle className="h-4 w-4 text-red-500 inline mr-1" />Data from other apps on your device</li>
										</ul>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Section 2 */}
						<Card className="border-border">
							<CardContent className="pt-6">
								<h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
									<Eye className="h-5 w-5 text-yellow-500" />
									2. How We Use Your Information
								</h2>
								<p className="text-muted-foreground mb-4">
									Your data is used exclusively to provide and improve TrickBook's features:
								</p>
								<ul className="space-y-3 text-muted-foreground">
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Authentication</strong> - To let you securely log in and access your account</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Progress Tracking</strong> - To save and display your trick progress</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Social Features</strong> - To show your posts to followers and enable interactions</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Direct Messaging</strong> - To deliver messages between you and your homies</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Notifications</strong> - To alert you about new messages, comments, and homie requests (you control these)</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Password Recovery</strong> - To send reset links if you forget your password</span>
									</li>
								</ul>

								<div className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
									<p className="text-sm text-foreground font-semibold mb-2">We will NEVER use your data to:</p>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• Sell to advertisers or data brokers</li>
										<li>• Build advertising profiles</li>
										<li>• Train AI models without explicit consent</li>
										<li>• Share with government agencies (unless legally compelled with valid warrant)</li>
									</ul>
								</div>
							</CardContent>
						</Card>

						{/* Section 3 - Security */}
						<Card className="border-border">
							<CardContent className="pt-6">
								<h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
									<Server className="h-5 w-5 text-yellow-500" />
									3. Security & Encryption
								</h2>
								<p className="text-muted-foreground mb-4">
									We implement enterprise-grade security measures to protect your data:
								</p>

								<div className="grid md:grid-cols-2 gap-4">
									<div className="p-4 rounded-lg bg-muted/50">
										<div className="flex items-center gap-2 mb-2">
											<Lock className="h-5 w-5 text-yellow-500" />
											<h3 className="font-semibold text-foreground">Data in Transit</h3>
										</div>
										<p className="text-sm text-muted-foreground">
											All connections use TLS 1.3 encryption (HTTPS). Your data is encrypted
											from your device to our servers - no one can intercept it.
										</p>
									</div>

									<div className="p-4 rounded-lg bg-muted/50">
										<div className="flex items-center gap-2 mb-2">
											<Database className="h-5 w-5 text-yellow-500" />
											<h3 className="font-semibold text-foreground">Data at Rest</h3>
										</div>
										<p className="text-sm text-muted-foreground">
											All data stored in MongoDB Atlas is encrypted using AES-256 encryption.
											Even if servers were breached, data would be unreadable.
										</p>
									</div>

									<div className="p-4 rounded-lg bg-muted/50">
										<div className="flex items-center gap-2 mb-2">
											<Key className="h-5 w-5 text-yellow-500" />
											<h3 className="font-semibold text-foreground">Password Security</h3>
										</div>
										<p className="text-sm text-muted-foreground">
											Passwords are hashed using bcrypt with salt rounds. We never store or
											can see your actual password - only a one-way hash.
										</p>
									</div>

									<div className="p-4 rounded-lg bg-muted/50">
										<div className="flex items-center gap-2 mb-2">
											<Shield className="h-5 w-5 text-yellow-500" />
											<h3 className="font-semibold text-foreground">Authentication</h3>
										</div>
										<p className="text-sm text-muted-foreground">
											We use JWT tokens with short expiration times. Sessions are validated
											on every request to prevent unauthorized access.
										</p>
									</div>
								</div>

								<div className="mt-6 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
									<h3 className="font-semibold text-foreground mb-2">Infrastructure Security</h3>
									<ul className="text-sm text-muted-foreground space-y-1">
										<li>• Hosted on AWS with SOC 2 Type II compliance</li>
										<li>• MongoDB Atlas with automatic encryption and backups</li>
										<li>• Regular security audits and penetration testing</li>
										<li>• DDoS protection and rate limiting</li>
										<li>• No third-party tracking scripts or analytics</li>
									</ul>
								</div>
							</CardContent>
						</Card>

						{/* Section 4 */}
						<Card className="border-border">
							<CardContent className="pt-6">
								<h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
									<UserX className="h-5 w-5 text-yellow-500" />
									4. Data Sharing
								</h2>
								<p className="text-muted-foreground mb-4">
									<strong className="text-foreground">We do not sell, rent, or share your personal data with third parties for commercial purposes. Period.</strong>
								</p>
								<p className="text-muted-foreground mb-4">
									The only circumstances where data may be shared:
								</p>
								<ul className="space-y-3 text-muted-foreground">
									<li className="flex items-start gap-3">
										<span className="font-semibold text-foreground min-w-[140px]">With Your Consent:</span>
										<span>Content you choose to make public (posts, profile info) is visible to other users</span>
									</li>
									<li className="flex items-start gap-3">
										<span className="font-semibold text-foreground min-w-[140px]">Service Providers:</span>
										<span>Limited data shared with infrastructure providers (AWS, MongoDB) solely to operate the service - they cannot use it for any other purpose</span>
									</li>
									<li className="flex items-start gap-3">
										<span className="font-semibold text-foreground min-w-[140px]">Legal Requirements:</span>
										<span>Only if required by valid legal process (court order, warrant) - we will notify you unless legally prohibited</span>
									</li>
								</ul>

								<div className="mt-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
									<h3 className="font-semibold text-foreground mb-2">Comparison: TrickBook vs. Big Tech</h3>
									<div className="overflow-x-auto">
										<table className="w-full text-sm">
											<thead>
												<tr className="border-b border-border">
													<th className="text-left py-2 text-muted-foreground">Practice</th>
													<th className="text-center py-2 text-muted-foreground">TrickBook</th>
													<th className="text-center py-2 text-muted-foreground">Big Tech</th>
												</tr>
											</thead>
											<tbody className="text-muted-foreground">
												<tr className="border-b border-border/50">
													<td className="py-2">Sells user data</td>
													<td className="text-center py-2"><XCircle className="h-4 w-4 text-green-500 inline" /></td>
													<td className="text-center py-2"><CheckCircle className="h-4 w-4 text-red-500 inline" /></td>
												</tr>
												<tr className="border-b border-border/50">
													<td className="py-2">Third-party trackers</td>
													<td className="text-center py-2"><XCircle className="h-4 w-4 text-green-500 inline" /></td>
													<td className="text-center py-2"><CheckCircle className="h-4 w-4 text-red-500 inline" /></td>
												</tr>
												<tr className="border-b border-border/50">
													<td className="py-2">Behavioral profiling</td>
													<td className="text-center py-2"><XCircle className="h-4 w-4 text-green-500 inline" /></td>
													<td className="text-center py-2"><CheckCircle className="h-4 w-4 text-red-500 inline" /></td>
												</tr>
												<tr className="border-b border-border/50">
													<td className="py-2">True data deletion</td>
													<td className="text-center py-2"><CheckCircle className="h-4 w-4 text-green-500 inline" /></td>
													<td className="text-center py-2"><XCircle className="h-4 w-4 text-red-500 inline" /></td>
												</tr>
												<tr>
													<td className="py-2">Reads your DMs for ads</td>
													<td className="text-center py-2"><XCircle className="h-4 w-4 text-green-500 inline" /></td>
													<td className="text-center py-2"><CheckCircle className="h-4 w-4 text-red-500 inline" /></td>
												</tr>
											</tbody>
										</table>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Section 5 */}
						<Card className="border-border">
							<CardContent className="pt-6">
								<h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
									<Trash2 className="h-5 w-5 text-yellow-500" />
									5. Your Rights & Data Control
								</h2>
								<p className="text-muted-foreground mb-4">
									You have complete control over your data. Here's what you can do:
								</p>
								<ul className="space-y-3 text-muted-foreground">
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Access</strong> - Download all your data anytime from your profile settings</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Correct</strong> - Update your profile information at any time</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Delete</strong> - Permanently delete your account and all associated data</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Export</strong> - Get a copy of your data in a portable format</span>
									</li>
									<li className="flex items-start gap-3">
										<CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
										<span><strong className="text-foreground">Opt-out</strong> - Control notification preferences and visibility settings</span>
									</li>
								</ul>
								<p className="text-sm text-muted-foreground mt-4">
									When you delete your account, we permanently remove all your data within 30 days.
									This includes your profile, posts, comments, messages, and progress data.
									This is real deletion - not just hiding your data like some platforms do.
								</p>
							</CardContent>
						</Card>

						{/* Section 6 */}
						<Card className="border-border">
							<CardContent className="pt-6">
								<h2 className="text-xl font-bold text-foreground mb-4">
									6. Cookies & Local Storage
								</h2>
								<p className="text-muted-foreground mb-4">
									We use minimal cookies and local storage only for essential functionality:
								</p>
								<ul className="space-y-2 text-muted-foreground">
									<li>• <strong className="text-foreground">Authentication tokens</strong> - To keep you logged in</li>
									<li>• <strong className="text-foreground">Theme preference</strong> - To remember dark/light mode</li>
									<li>• <strong className="text-foreground">Session data</strong> - For security and functionality</li>
								</ul>
								<p className="text-sm text-muted-foreground mt-4">
									We do NOT use cookies for tracking, advertising, or analytics. No third-party cookies are set.
								</p>
							</CardContent>
						</Card>

						{/* Section 7 */}
						<Card className="border-border">
							<CardContent className="pt-6">
								<h2 className="text-xl font-bold text-foreground mb-4">
									7. Children's Privacy
								</h2>
								<p className="text-muted-foreground">
									TrickBook is intended for users aged 13 and older. We do not knowingly collect
									personal information from children under 13. If you believe a child under 13 has
									provided us with personal information, please contact us immediately and we will
									delete that information.
								</p>
							</CardContent>
						</Card>

						{/* Section 8 */}
						<Card className="border-border">
							<CardContent className="pt-6">
								<h2 className="text-xl font-bold text-foreground mb-4">
									8. Changes to This Policy
								</h2>
								<p className="text-muted-foreground">
									We may update this Privacy Policy from time to time. We will notify you of any
									significant changes by posting the new policy on this page and updating the
									"Last updated" date. For major changes, we'll also send you an email notification.
								</p>
							</CardContent>
						</Card>

						{/* Section 9 - Contact */}
						<Card className="border-border">
							<CardContent className="pt-6">
								<h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
									<Mail className="h-5 w-5 text-yellow-500" />
									9. Contact Us
								</h2>
								<p className="text-muted-foreground mb-4">
									Have questions about your privacy? We're here to help.
								</p>
								<div className="space-y-2 text-muted-foreground">
									<p>
										<strong className="text-foreground">Email:</strong>{" "}
										<a href="mailto:privacy@thetrickbook.com" className="text-yellow-500 hover:text-yellow-400">
											privacy@thetrickbook.com
										</a>
									</p>
									<p>
										<strong className="text-foreground">Website:</strong>{" "}
										<a href="https://thetrickbook.com" className="text-yellow-500 hover:text-yellow-400">
											thetrickbook.com
										</a>
									</p>
								</div>
								<p className="text-sm text-muted-foreground mt-4">
									We aim to respond to all privacy inquiries within 48 hours.
								</p>
							</CardContent>
						</Card>
					</div>

					{/* Back Button */}
					<div className="mt-8 flex justify-center">
						<Link href="/">
							<Button variant="outline" className="gap-2">
								<ArrowLeft className="h-4 w-4" />
								Back to Home
							</Button>
						</Link>
					</div>
				</div>
			</div>
		</>
	);
}
