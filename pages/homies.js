import React, { useContext, useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { AuthContext } from "../auth/AuthContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Users, UserPlus, Bell, Search, UserMinus, Check, X, Loader2 } from "lucide-react";
import {
	getDiscoverableUsers,
	getMyHomies,
	getPendingRequests,
	sendHomieRequest,
	acceptHomieRequest,
	rejectHomieRequest,
	removeHomie,
} from "../lib/apiHomies";

export default function Homies() {
	const { loggedIn, token } = useContext(AuthContext);
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("my-homies");

	// Data states
	const [homies, setHomies] = useState([]);
	const [discoverableUsers, setDiscoverableUsers] = useState([]);
	const [requests, setRequests] = useState({ received: [], sent: [] });
	const [sentRequestIds, setSentRequestIds] = useState(new Set()); // Track locally sent requests

	// Loading states
	const [loadingHomies, setLoadingHomies] = useState(true);
	const [loadingDiscoverable, setLoadingDiscoverable] = useState(true);
	const [loadingRequests, setLoadingRequests] = useState(true);
	const [actionLoading, setActionLoading] = useState(null); // Track which action is loading

	// Fetch data on mount
	useEffect(() => {
		if (token) {
			fetchHomies();
			fetchDiscoverableUsers();
			fetchRequests();
		}
	}, [token]);

	const fetchHomies = async () => {
		setLoadingHomies(true);
		try {
			const data = await getMyHomies(token);
			setHomies(data);
		} catch (error) {
			console.error("Error fetching homies:", error);
		} finally {
			setLoadingHomies(false);
		}
	};

	const fetchDiscoverableUsers = async () => {
		setLoadingDiscoverable(true);
		try {
			const data = await getDiscoverableUsers(token);
			setDiscoverableUsers(data);
		} catch (error) {
			console.error("Error fetching discoverable users:", error);
		} finally {
			setLoadingDiscoverable(false);
		}
	};

	const fetchRequests = async () => {
		setLoadingRequests(true);
		try {
			const data = await getPendingRequests(token);
			setRequests(data);
			// Initialize sentRequestIds from fetched sent requests
			if (data.sent?.length > 0) {
				setSentRequestIds(new Set(data.sent.map(u => u._id)));
			}
		} catch (error) {
			console.error("Error fetching requests:", error);
		} finally {
			setLoadingRequests(false);
		}
	};

	const handleSendRequest = async (userId) => {
		setActionLoading(userId);
		try {
			await sendHomieRequest(userId, token);
			// Mark as requested locally (keep in list but show as requested)
			setSentRequestIds(prev => new Set([...prev, userId]));
			// Refresh requests to show in sent
			fetchRequests();
		} catch (error) {
			console.error("Error sending request:", error);
			alert(error.response?.data?.error || "Failed to send request");
		} finally {
			setActionLoading(null);
		}
	};

	const handleAcceptRequest = async (userId) => {
		setActionLoading(userId);
		try {
			await acceptHomieRequest(userId, token);
			// Refresh both homies and requests
			fetchHomies();
			fetchRequests();
		} catch (error) {
			console.error("Error accepting request:", error);
			alert(error.response?.data?.error || "Failed to accept request");
		} finally {
			setActionLoading(null);
		}
	};

	const handleRejectRequest = async (userId) => {
		setActionLoading(`reject-${userId}`);
		try {
			await rejectHomieRequest(userId, token);
			// Refresh requests
			fetchRequests();
		} catch (error) {
			console.error("Error rejecting request:", error);
			alert(error.response?.data?.error || "Failed to reject request");
		} finally {
			setActionLoading(null);
		}
	};

	const handleRemoveHomie = async (userId) => {
		if (!confirm("Are you sure you want to remove this homie?")) return;
		setActionLoading(userId);
		try {
			await removeHomie(userId, token);
			// Refresh homies
			fetchHomies();
			// Refresh discoverable in case they should reappear
			fetchDiscoverableUsers();
		} catch (error) {
			console.error("Error removing homie:", error);
			alert(error.response?.data?.error || "Failed to remove homie");
		} finally {
			setActionLoading(null);
		}
	};

	// User card component
	const UserCard = ({ user, actions }) => (
		<div className="flex items-center justify-between p-4 rounded-lg bg-secondary/10 border border-border">
			<div className="flex items-center gap-3">
				<Image
					src={user.imageUri || "/default-profile.png"}
					alt={user.name || "User"}
					width={48}
					height={48}
					className="rounded-full object-cover"
					style={{ width: 48, height: 48 }}
				/>
				<div>
					<p className="font-medium text-foreground">{user.name || "Unknown"}</p>
					<p className="text-sm text-muted-foreground">{user.email}</p>
				</div>
			</div>
			<div className="flex gap-2">
				{actions}
			</div>
		</div>
	);

	// Redirect to login if not logged in
	if (loggedIn === false) {
		return (
			<>
				<Head>
					<title>Homies | Trick Book</title>
					<meta name="description" content="Connect with fellow riders on Trick Book" />
				</Head>
				<div className="container mx-auto px-4 py-16 text-center">
					<Users className="h-24 w-24 mx-auto text-muted-foreground mb-6" />
					<h1 className="text-4xl font-bold text-foreground mb-4">Homies</h1>
					<p className="text-muted-foreground text-lg max-w-md mx-auto mb-8">
						Sign in to connect with fellow riders and build your crew.
					</p>
					<Button
						onClick={() => router.push("/login")}
						className="bg-yellow-500 hover:bg-yellow-600 text-black"
					>
						Sign In
					</Button>
				</div>
			</>
		);
	}

	// Loading state
	if (loggedIn === null) {
		return (
			<>
				<Head>
					<title>Homies | Trick Book</title>
				</Head>
				<div className="container mx-auto px-4 py-16 text-center">
					<Loader2 className="h-12 w-12 mx-auto text-yellow-500 animate-spin" />
				</div>
			</>
		);
	}

	const pendingCount = requests.received?.length || 0;

	return (
		<>
			<Head>
				<title>Homies | Trick Book</title>
				<meta name="description" content="Connect with fellow riders on Trick Book" />
			</Head>
			<div className="container mx-auto px-4 py-8">
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-foreground mb-2">Homies</h1>
						<p className="text-muted-foreground">
							Connect with fellow riders and build your crew
						</p>
					</div>

					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
						<TabsList className="grid w-full grid-cols-3 mb-8">
							<TabsTrigger
								value="my-homies"
								className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
							>
								<Users className="h-4 w-4 mr-2" />
								My Homies
								{homies.length > 0 && (
									<Badge variant="secondary" className="ml-2">{homies.length}</Badge>
								)}
							</TabsTrigger>
							<TabsTrigger
								value="requests"
								className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
							>
								<Bell className="h-4 w-4 mr-2" />
								Requests
								{pendingCount > 0 && (
									<Badge className="ml-2 bg-red-500">{pendingCount}</Badge>
								)}
							</TabsTrigger>
							<TabsTrigger
								value="find"
								className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
							>
								<Search className="h-4 w-4 mr-2" />
								Find Homies
							</TabsTrigger>
						</TabsList>

						{/* My Homies Tab */}
						<TabsContent value="my-homies">
							<Card>
								<CardHeader>
									<CardTitle>My Homies</CardTitle>
									<CardDescription>
										Riders you&apos;ve connected with
									</CardDescription>
								</CardHeader>
								<CardContent>
									{loadingHomies ? (
										<div className="text-center py-12">
											<Loader2 className="h-8 w-8 mx-auto text-yellow-500 animate-spin" />
										</div>
									) : homies.length === 0 ? (
										<div className="text-center py-12">
											<Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
											<p className="text-muted-foreground mb-4">
												You haven&apos;t added any homies yet.
											</p>
											<Button
												onClick={() => setActiveTab("find")}
												className="bg-yellow-500 hover:bg-yellow-600 text-black"
											>
												<UserPlus className="h-4 w-4 mr-2" />
												Find Homies
											</Button>
										</div>
									) : (
										<div className="space-y-3">
											{homies.map((homie) => (
												<UserCard
													key={homie._id}
													user={homie}
													actions={
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleRemoveHomie(homie._id)}
															disabled={actionLoading === homie._id}
															className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
														>
															{actionLoading === homie._id ? (
																<Loader2 className="h-4 w-4 animate-spin" />
															) : (
																<>
																	<UserMinus className="h-4 w-4 mr-1" />
																	Remove
																</>
															)}
														</Button>
													}
												/>
											))}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						{/* Requests Tab */}
						<TabsContent value="requests">
							<div className="space-y-6">
								{/* Received Requests */}
								<Card>
									<CardHeader>
										<CardTitle>Received Requests</CardTitle>
										<CardDescription>
											Riders who want to connect with you
										</CardDescription>
									</CardHeader>
									<CardContent>
										{loadingRequests ? (
											<div className="text-center py-8">
												<Loader2 className="h-8 w-8 mx-auto text-yellow-500 animate-spin" />
											</div>
										) : requests.received?.length === 0 ? (
											<div className="text-center py-8">
												<Bell className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
												<p className="text-muted-foreground">No pending requests</p>
											</div>
										) : (
											<div className="space-y-3">
												{requests.received.map((request) => (
													<UserCard
														key={request.from}
														user={request.user}
														actions={
															<>
																<Button
																	size="sm"
																	onClick={() => handleAcceptRequest(request.from)}
																	disabled={actionLoading === request.from}
																	className="bg-green-500 hover:bg-green-600 text-white"
																>
																	{actionLoading === request.from ? (
																		<Loader2 className="h-4 w-4 animate-spin" />
																	) : (
																		<>
																			<Check className="h-4 w-4 mr-1" />
																			Accept
																		</>
																	)}
																</Button>
																<Button
																	variant="outline"
																	size="sm"
																	onClick={() => handleRejectRequest(request.from)}
																	disabled={actionLoading === `reject-${request.from}`}
																	className="text-red-500 hover:text-red-600"
																>
																	{actionLoading === `reject-${request.from}` ? (
																		<Loader2 className="h-4 w-4 animate-spin" />
																	) : (
																		<>
																			<X className="h-4 w-4 mr-1" />
																			Decline
																		</>
																	)}
																</Button>
															</>
														}
													/>
												))}
											</div>
										)}
									</CardContent>
								</Card>

								{/* Sent Requests */}
								<Card>
									<CardHeader>
										<CardTitle>Sent Requests</CardTitle>
										<CardDescription>
											Waiting for response
										</CardDescription>
									</CardHeader>
									<CardContent>
										{loadingRequests ? (
											<div className="text-center py-8">
												<Loader2 className="h-8 w-8 mx-auto text-yellow-500 animate-spin" />
											</div>
										) : requests.sent?.length === 0 ? (
											<div className="text-center py-8">
												<p className="text-muted-foreground">No pending sent requests</p>
											</div>
										) : (
											<div className="space-y-3">
												{requests.sent.map((user) => (
													<UserCard
														key={user._id}
														user={user}
														actions={
															<Badge variant="secondary">Pending</Badge>
														}
													/>
												))}
											</div>
										)}
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						{/* Find Homies Tab */}
						<TabsContent value="find">
							<Card>
								<CardHeader>
									<CardTitle>Find Homies</CardTitle>
									<CardDescription>
										Discover riders who have enabled network discovery
									</CardDescription>
								</CardHeader>
								<CardContent>
									{loadingDiscoverable ? (
										<div className="text-center py-12">
											<Loader2 className="h-8 w-8 mx-auto text-yellow-500 animate-spin" />
										</div>
									) : discoverableUsers.length === 0 ? (
										<div className="text-center py-12">
											<Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
											<p className="text-muted-foreground mb-2">
												No discoverable riders found right now.
											</p>
											<p className="text-sm text-muted-foreground">
												Make sure you&apos;ve enabled network discovery in your profile to be found by others!
											</p>
											<Button
												onClick={() => router.push("/profile")}
												variant="outline"
												className="mt-4"
											>
												Go to Profile Settings
											</Button>
										</div>
									) : (
										<div className="space-y-3">
											{discoverableUsers.map((user) => {
												const isRequested = sentRequestIds.has(user._id);
												return (
													<UserCard
														key={user._id}
														user={user}
														actions={
															isRequested ? (
																<Button
																	size="sm"
																	disabled
																	variant="outline"
																	className="cursor-not-allowed"
																>
																	<Check className="h-4 w-4 mr-1" />
																	Requested
																</Button>
															) : (
																<Button
																	size="sm"
																	onClick={() => handleSendRequest(user._id)}
																	disabled={actionLoading === user._id}
																	className="bg-yellow-500 hover:bg-yellow-600 text-black"
																>
																	{actionLoading === user._id ? (
																		<Loader2 className="h-4 w-4 animate-spin" />
																	) : (
																		<>
																			<UserPlus className="h-4 w-4 mr-1" />
																			Add Homie
																		</>
																	)}
																</Button>
															)
														}
													/>
												);
											})}
										</div>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
			</div>
		</>
	);
}
