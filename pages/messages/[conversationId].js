import { useState, useEffect, useContext, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { AuthContext } from "../../auth/AuthContext";
import {
	getConversation,
	getMessages,
	sendMessage,
	markAsRead,
} from "../../lib/apiMessages";
import { connectMessagesSocket } from "../../lib/socket";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
	ArrowLeft,
	User,
	Loader2,
	Send,
	Check,
	CheckCheck,
} from "lucide-react";

export default function Conversation() {
	const router = useRouter();
	const { conversationId } = router.query;
	const { token, loggedIn, user } = useContext(AuthContext);
	const userId = user?.userId || user?._id;

	const [conversation, setConversation] = useState(null);
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [newMessage, setNewMessage] = useState("");
	const [sending, setSending] = useState(false);
	const [otherTyping, setOtherTyping] = useState(false);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);

	const messagesEndRef = useRef(null);
	const messagesContainerRef = useRef(null);
	const socketRef = useRef(null);
	const typingTimeoutRef = useRef(null);
	const isTypingRef = useRef(false);

	// Auth check
	useEffect(() => {
		if (loggedIn === false) {
			router.push("/login");
		}
	}, [loggedIn, router]);

	// Load conversation and messages
	useEffect(() => {
		if (!conversationId || !token) return;
		loadConversation();
	}, [conversationId, token]);

	// Socket setup
	useEffect(() => {
		if (!token || !conversationId) return;

		const socket = connectMessagesSocket(token);
		socketRef.current = socket;

		// Join conversation room for typing indicators
		socket.emit("join:conversation", conversationId);

		// Listen for new messages
		socket.on("message:new", ({ message }) => {
			if (message.conversationId === conversationId) {
				setMessages((prev) => {
					// Avoid duplicates
					if (prev.some((m) => m._id === message._id)) return prev;
					return [...prev, message];
				});
				scrollToBottom();

				// Mark as read if we receive it
				if (message.senderId !== userId) {
					markAsRead(conversationId, token);
				}
			}
		});

		// Typing indicators
		socket.on("typing:start", ({ userId: typerId }) => {
			if (typerId !== userId) {
				setOtherTyping(true);
			}
		});

		socket.on("typing:stop", ({ userId: typerId }) => {
			if (typerId !== userId) {
				setOtherTyping(false);
			}
		});

		// Read receipts
		socket.on("messages:read", ({ conversationId: cId, readBy }) => {
			if (cId === conversationId && readBy !== userId) {
				// Update all our sent messages to "read"
				setMessages((prev) =>
					prev.map((m) =>
						m.senderId === userId && m.status !== "read"
							? { ...m, status: "read" }
							: m
					)
				);
			}
		});

		return () => {
			socket.emit("leave:conversation", conversationId);
			socket.off("message:new");
			socket.off("typing:start");
			socket.off("typing:stop");
			socket.off("messages:read");
		};
	}, [conversationId, token, userId]);

	const loadConversation = async () => {
		try {
			const [convoData, messagesData] = await Promise.all([
				getConversation(conversationId, token),
				getMessages(conversationId, { page: 1, limit: 50 }, token),
			]);

			setConversation(convoData);
			setMessages(messagesData.messages || []);
			setHasMore(messagesData.pagination?.hasMore || false);
			setPage(1);

			// Mark as read on load
			markAsRead(conversationId, token);

			// Scroll to bottom after messages load
			setTimeout(scrollToBottom, 100);
		} catch (error) {
			console.error("Error loading conversation:", error);
			if (error.response?.status === 404) {
				router.push("/messages");
			}
		} finally {
			setLoading(false);
		}
	};

	const loadMoreMessages = async () => {
		if (loadingMore || !hasMore) return;

		setLoadingMore(true);
		try {
			const nextPage = page + 1;
			const data = await getMessages(
				conversationId,
				{ page: nextPage, limit: 50 },
				token
			);

			// Prepend older messages
			setMessages((prev) => [...(data.messages || []), ...prev]);
			setHasMore(data.pagination?.hasMore || false);
			setPage(nextPage);
		} catch (error) {
			console.error("Error loading more messages:", error);
		} finally {
			setLoadingMore(false);
		}
	};

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	const handleTyping = (e) => {
		setNewMessage(e.target.value);

		// Send typing indicator
		if (!isTypingRef.current && socketRef.current) {
			isTypingRef.current = true;
			socketRef.current.emit("typing:start", { conversationId });
		}

		// Clear previous timeout
		clearTimeout(typingTimeoutRef.current);

		// Stop typing after 2 seconds of inactivity
		typingTimeoutRef.current = setTimeout(() => {
			isTypingRef.current = false;
			socketRef.current?.emit("typing:stop", { conversationId });
		}, 2000);
	};

	const handleSend = async (e) => {
		e.preventDefault();
		if (!newMessage.trim() || sending) return;

		// Stop typing indicator
		isTypingRef.current = false;
		clearTimeout(typingTimeoutRef.current);
		socketRef.current?.emit("typing:stop", { conversationId });

		const content = newMessage.trim();
		setNewMessage("");
		setSending(true);

		// Optimistic update
		const optimisticMsg = {
			_id: `temp-${Date.now()}`,
			conversationId,
			senderId: userId,
			content,
			status: "sending",
			createdAt: new Date().toISOString(),
		};

		setMessages((prev) => [...prev, optimisticMsg]);
		scrollToBottom();

		try {
			const message = await sendMessage(conversationId, content, token);
			// Replace optimistic message with real one
			setMessages((prev) =>
				prev.map((m) => (m._id === optimisticMsg._id ? message : m))
			);
		} catch (error) {
			console.error("Error sending message:", error);
			// Remove failed message and restore input
			setMessages((prev) => prev.filter((m) => m._id !== optimisticMsg._id));
			setNewMessage(content);
			alert("Failed to send message. Please try again.");
		} finally {
			setSending(false);
		}
	};

	const formatTime = (date) => {
		return new Date(date).toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDate = (date) => {
		const msgDate = new Date(date);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (msgDate.toDateString() === today.toDateString()) {
			return "Today";
		} else if (msgDate.toDateString() === yesterday.toDateString()) {
			return "Yesterday";
		} else {
			return msgDate.toLocaleDateString([], {
				weekday: "long",
				month: "short",
				day: "numeric",
			});
		}
	};

	// Group messages by date
	const groupedMessages = messages.reduce((groups, message) => {
		const date = new Date(message.createdAt).toDateString();
		if (!groups[date]) {
			groups[date] = [];
		}
		groups[date].push(message);
		return groups;
	}, {});

	const otherUser = conversation?.otherUser;

	// Loading state
	if (loading || loggedIn === undefined) {
		return (
			<div className="min-h-screen bg-background flex items-center justify-center">
				<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>
					{otherUser?.name || "Chat"} | Messages | The Trick Book
				</title>
				<link rel="icon" href="/favicon.png" />
			</Head>

			<div className="flex flex-col h-screen bg-background">
				{/* Header */}
				<div className="flex items-center gap-3 p-4 border-b border-border bg-card sticky top-0 z-10">
					<Link
						href="/messages"
						className="text-muted-foreground hover:text-foreground transition-colors"
					>
						<ArrowLeft className="h-5 w-5" />
					</Link>

					<Link
						href={`/profile/${otherUser?._id}`}
						className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
					>
						{otherUser?.imageUri ? (
							<Image
								src={otherUser.imageUri}
								alt={otherUser.name || "User"}
								width={40}
								height={40}
								className="rounded-full object-cover"
								style={{ width: 40, height: 40 }}
							/>
						) : (
							<div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
								<User className="h-5 w-5 text-muted-foreground" />
							</div>
						)}
						<div>
							<p className="font-medium text-foreground">
								{otherUser?.name || "Unknown"}
							</p>
							{otherTyping && (
								<p className="text-xs text-yellow-500">typing...</p>
							)}
						</div>
					</Link>
				</div>

				{/* Messages */}
				<div
					ref={messagesContainerRef}
					className="flex-1 overflow-y-auto p-4 space-y-4"
				>
					{/* Load More Button */}
					{hasMore && (
						<div className="text-center py-2">
							<button
								onClick={loadMoreMessages}
								disabled={loadingMore}
								className="text-sm text-yellow-500 hover:underline"
							>
								{loadingMore ? (
									<Loader2 className="h-4 w-4 animate-spin inline" />
								) : (
									"Load earlier messages"
								)}
							</button>
						</div>
					)}

					{/* Messages grouped by date */}
					{Object.entries(groupedMessages).map(([date, dateMessages]) => (
						<div key={date}>
							{/* Date Divider */}
							<div className="flex items-center justify-center my-4">
								<span className="text-xs text-muted-foreground bg-background px-3 py-1 rounded-full border border-border">
									{formatDate(dateMessages[0].createdAt)}
								</span>
							</div>

							{/* Messages for this date */}
							<div className="space-y-2">
								{dateMessages.map((msg) => {
									const isMine = msg.senderId === userId;
									return (
										<div
											key={msg._id}
											className={`flex ${isMine ? "justify-end" : "justify-start"}`}
										>
											<div className={`max-w-[75%] ${isMine ? "order-2" : ""}`}>
												<div
													className={`px-4 py-2 rounded-2xl ${
														isMine
															? "bg-yellow-500 text-black rounded-br-sm"
															: "bg-secondary text-foreground rounded-bl-sm"
													}`}
												>
													<p className="text-sm whitespace-pre-wrap break-words">
														{msg.content}
													</p>
												</div>
												<div
													className={`flex items-center gap-1 mt-1 ${
														isMine ? "justify-end" : "justify-start"
													}`}
												>
													<span className="text-xs text-muted-foreground">
														{formatTime(msg.createdAt)}
													</span>
													{isMine && (
														<span className="text-xs">
															{msg.status === "sending" && (
																<Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
															)}
															{msg.status === "sent" && (
																<Check className="h-3 w-3 text-muted-foreground" />
															)}
															{msg.status === "read" && (
																<CheckCheck className="h-3 w-3 text-yellow-500" />
															)}
															{!msg.status && (
																<Check className="h-3 w-3 text-muted-foreground" />
															)}
														</span>
													)}
												</div>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					))}

					{/* Typing Indicator */}
					{otherTyping && (
						<div className="flex justify-start">
							<div className="bg-secondary rounded-2xl rounded-bl-sm px-4 py-2">
								<div className="flex gap-1">
									<span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
									<span
										className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
										style={{ animationDelay: "0.1s" }}
									/>
									<span
										className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
										style={{ animationDelay: "0.2s" }}
									/>
								</div>
							</div>
						</div>
					)}

					<div ref={messagesEndRef} />
				</div>

				{/* Message Input */}
				<form
					onSubmit={handleSend}
					className="p-4 border-t border-border bg-card"
				>
					<div className="flex gap-2">
						<Input
							value={newMessage}
							onChange={handleTyping}
							placeholder="Type a message..."
							className="flex-1"
							disabled={sending}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSend(e);
								}
							}}
						/>
						<Button
							type="submit"
							disabled={!newMessage.trim() || sending}
							className="bg-yellow-500 hover:bg-yellow-600 text-black px-4"
						>
							{sending ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Send className="h-4 w-4" />
							)}
						</Button>
					</div>
				</form>
			</div>
		</>
	);
}
