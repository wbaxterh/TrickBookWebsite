import { useState, useEffect, useContext } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { AuthContext } from "../../auth/AuthContext";
import { getConversations } from "../../lib/apiMessages";
import { connectMessagesSocket } from "../../lib/socket";
import { MessageCircle, User, Loader2, Search, Plus } from "lucide-react";
import { Input } from "../../components/ui/input";

export default function Messages() {
	const { token, loggedIn, user } = useContext(AuthContext);
	const router = useRouter();
	const userId = user?.userId || user?._id;

	const [conversations, setConversations] = useState([]);
	const [loading, setLoading] = useState(true);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		if (loggedIn === false) {
			router.push("/login");
			return;
		}

		if (token) {
			loadConversations();
			setupSocket();
		}
	}, [token, loggedIn]);

	const loadConversations = async () => {
		try {
			const data = await getConversations(token);
			setConversations(data || []);
		} catch (error) {
			console.error("Error loading conversations:", error);
		} finally {
			setLoading(false);
		}
	};

	const setupSocket = () => {
		const socket = connectMessagesSocket(token);

		// Listen for new messages to update conversation list
		socket.on("message:new", ({ message, conversation }) => {
			setConversations((prev) => {
				// Find and update the conversation
				const exists = prev.find((c) => c._id === conversation._id);
				if (exists) {
					// Move to top and update last message
					const updated = prev.filter((c) => c._id !== conversation._id);
					return [
						{
							...exists,
							lastMessage: conversation.lastMessage,
							unreadCount: (exists.unreadCount || 0) + 1,
						},
						...updated,
					];
				}
				// New conversation - reload to get full data
				loadConversations();
				return prev;
			});
		});

		// Listen for read receipts
		socket.on("messages:read", ({ conversationId }) => {
			setConversations((prev) =>
				prev.map((c) =>
					c._id === conversationId ? { ...c, unreadCount: 0 } : c
				)
			);
		});

		return () => {
			socket.off("message:new");
			socket.off("messages:read");
		};
	};

	const filteredConversations = conversations.filter((convo) => {
		if (!searchQuery) return true;
		const name = convo.otherUser?.name?.toLowerCase() || "";
		return name.includes(searchQuery.toLowerCase());
	});

	const formatTime = (date) => {
		if (!date) return "";
		const now = new Date();
		const msgDate = new Date(date);
		const diffMs = now - msgDate;
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);

		if (diffMins < 1) return "now";
		if (diffMins < 60) return `${diffMins}m`;
		if (diffHours < 24) return `${diffHours}h`;
		if (diffDays < 7) return `${diffDays}d`;
		return msgDate.toLocaleDateString();
	};

	// Show loading while checking auth
	if (loggedIn === undefined) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
			</div>
		);
	}

	// Redirect handled in useEffect, but show loading in meantime
	if (loggedIn === false) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>Messages | The Trick Book</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="Direct messages with your homies" />
			</Head>

			<div className="min-h-screen bg-background">
				<div className="container mx-auto px-4 py-8 max-w-2xl">
					{/* Header */}
					<div className="flex items-center justify-between mb-6">
						<h1 className="text-3xl font-bold text-foreground">Messages</h1>
						<Link
							href="/homies"
							className="flex items-center gap-2 text-sm text-yellow-500 hover:text-yellow-400 transition-colors"
						>
							<Plus className="h-4 w-4" />
							New Message
						</Link>
					</div>

					{/* Search */}
					<div className="relative mb-6">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							placeholder="Search conversations..."
							className="pl-10"
						/>
					</div>

					{/* Conversations List */}
					{loading ? (
						<div className="flex justify-center py-12">
							<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
						</div>
					) : filteredConversations.length === 0 ? (
						<div className="text-center py-16">
							<MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
							<h2 className="text-xl font-semibold text-foreground mb-2">
								{searchQuery ? "No conversations found" : "No messages yet"}
							</h2>
							<p className="text-muted-foreground mb-6">
								{searchQuery
									? "Try a different search term"
									: "Start a conversation with your homies"}
							</p>
							{!searchQuery && (
								<Link
									href="/homies"
									className="inline-flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
								>
									<Plus className="h-4 w-4" />
									Find Homies
								</Link>
							)}
						</div>
					) : (
						<div className="space-y-2">
							{filteredConversations.map((convo) => (
								<Link
									key={convo._id}
									href={`/messages/${convo._id}`}
									className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-yellow-500/50 transition-all"
								>
									{/* Avatar */}
									{convo.otherUser?.imageUri ? (
										<Image
											src={convo.otherUser.imageUri}
											alt={convo.otherUser.name || "User"}
											width={52}
											height={52}
											className="rounded-full object-cover flex-shrink-0"
											style={{ width: 52, height: 52 }}
										/>
									) : (
										<div className="w-[52px] h-[52px] rounded-full bg-muted flex items-center justify-center flex-shrink-0">
											<User className="h-6 w-6 text-muted-foreground" />
										</div>
									)}

									{/* Content */}
									<div className="flex-1 min-w-0">
										<div className="flex items-center justify-between mb-1">
											<p
												className={`font-medium truncate ${
													convo.unreadCount > 0
														? "text-foreground"
														: "text-foreground"
												}`}
											>
												{convo.otherUser?.name || "Unknown"}
											</p>
											<span className="text-xs text-muted-foreground flex-shrink-0 ml-2">
												{formatTime(convo.lastMessage?.createdAt)}
											</span>
										</div>
										{convo.lastMessage && (
											<p
												className={`text-sm truncate ${
													convo.unreadCount > 0
														? "text-foreground font-medium"
														: "text-muted-foreground"
												}`}
											>
												{convo.lastMessage.senderId === userId ? (
													<span className="text-muted-foreground">You: </span>
												) : null}
												{convo.lastMessage.content}
											</p>
										)}
									</div>

									{/* Unread Badge */}
									{convo.unreadCount > 0 && (
										<div className="flex-shrink-0">
											<span className="bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-full min-w-[24px] text-center inline-block">
												{convo.unreadCount > 99 ? "99+" : convo.unreadCount}
											</span>
										</div>
									)}
								</Link>
							))}
						</div>
					)}
				</div>
			</div>
		</>
	);
}
