import Head from "next/head";
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useRouter } from "next/router";
import { Search, Plus, Loader2, BookOpen, Lock, Globe, Trash2, Edit2, Check, X } from "lucide-react";
import TrickipediaSidebar from "../components/TrickipediaSidebar";
import TrickCard from "../components/TrickCard";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "../components/ui/dialog";
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from "../components/ui/pagination";
import { getSortedTricksData } from "../lib/apiTrickipedia";
import { getUserTrickLists, createTrickList, deleteTrickList, updateTrickList, getPublicTrickLists, toggleTrickListPublic } from "../lib/apiTrickLists";
import { AuthContext } from "../auth/AuthContext";

const ITEMS_PER_PAGE = 20;

export default function TrickBook() {
	const router = useRouter();
	const { loggedIn, token, userId } = useContext(AuthContext);

	// Sidebar state
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [activeTab, setActiveTab] = useState("trickipedia");

	// Trickipedia state
	const [tricks, setTricks] = useState([]);
	const [filteredTricks, setFilteredTricks] = useState([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [searchFocused, setSearchFocused] = useState(false);
	const [currentPage, setCurrentPage] = useState(1);
	const [loading, setLoading] = useState(true);

	// My Trick Lists state
	const [myLists, setMyLists] = useState([]);
	const [listsLoading, setListsLoading] = useState(false);

	// Homie Lists state
	const [homieLists, setHomieLists] = useState([]);
	const [homieListsLoading, setHomieListsLoading] = useState(false);

	// Create list dialog
	const [createDialogOpen, setCreateDialogOpen] = useState(false);
	const [newListName, setNewListName] = useState("");
	const [creating, setCreating] = useState(false);

	// Delete list dialog
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [listToDelete, setListToDelete] = useState(null);
	const [deleting, setDeleting] = useState(false);

	// Edit list state
	const [editingListId, setEditingListId] = useState(null);
	const [editingName, setEditingName] = useState("");

	// Fetch tricks for Trickipedia
	const fetchTricks = useCallback(async () => {
		setLoading(true);
		try {
			const category = selectedCategory === "all" ? null : selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
			const tricksData = await getSortedTricksData(category);
			setTricks(tricksData);
			setFilteredTricks(tricksData);
		} catch (error) {
			console.error("Error fetching tricks:", error);
		} finally {
			setLoading(false);
		}
	}, [selectedCategory]);

	// Fetch user's trick lists
	const fetchMyLists = useCallback(async () => {
		if (!loggedIn || !userId) return;
		setListsLoading(true);
		try {
			const lists = await getUserTrickLists(userId, token);
			setMyLists(lists);
		} catch (error) {
			console.error("Error fetching my lists:", error);
		} finally {
			setListsLoading(false);
		}
	}, [loggedIn, userId, token]);

	// Fetch public trick lists (homie lists)
	const fetchHomieLists = useCallback(async () => {
		setHomieListsLoading(true);
		try {
			const lists = await getPublicTrickLists(token);
			setHomieLists(lists);
		} catch (error) {
			console.error("Error fetching homie lists:", error);
		} finally {
			setHomieListsLoading(false);
		}
	}, [token]);

	// Initial fetch based on active tab
	useEffect(() => {
		if (activeTab === "trickipedia") {
			fetchTricks();
		} else if (activeTab === "my-lists") {
			fetchMyLists();
		} else if (activeTab === "homie-lists") {
			fetchHomieLists();
		}
	}, [activeTab, fetchTricks, fetchMyLists, fetchHomieLists]);

	// Search filter for Trickipedia
	useEffect(() => {
		if (!searchTerm) {
			setFilteredTricks(tricks);
		} else {
			const filtered = tricks.filter(
				(trick) =>
					trick.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
					trick.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
					trick.category?.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredTricks(filtered);
		}
		setCurrentPage(1);
	}, [searchTerm, tricks]);

	// Refetch when category changes
	useEffect(() => {
		if (activeTab === "trickipedia") {
			fetchTricks();
		}
	}, [selectedCategory, activeTab, fetchTricks]);

	// Pagination
	const totalPages = Math.ceil(filteredTricks.length / ITEMS_PER_PAGE);
	const paginatedTricks = filteredTricks.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	// Handle category change
	const handleCategoryChange = (category) => {
		setSelectedCategory(category);
		setCurrentPage(1);
	};

	// Handle tab change
	const handleTabChange = (tab) => {
		setActiveTab(tab);
		setCurrentPage(1);
	};

	// Create new list
	const handleCreateList = async () => {
		if (!newListName.trim()) return;
		setCreating(true);
		try {
			await createTrickList(newListName, userId, token);
			setCreateDialogOpen(false);
			setNewListName("");
			fetchMyLists();
		} catch (error) {
			console.error("Error creating list:", error);
			alert("Failed to create list");
		} finally {
			setCreating(false);
		}
	};

	// Delete list
	const handleDeleteList = async () => {
		if (!listToDelete) return;
		setDeleting(true);
		try {
			await deleteTrickList(listToDelete._id, token);
			setDeleteDialogOpen(false);
			setListToDelete(null);
			fetchMyLists();
		} catch (error) {
			console.error("Error deleting list:", error);
			alert("Failed to delete list");
		} finally {
			setDeleting(false);
		}
	};

	// Start editing list name
	const startEditing = (list) => {
		setEditingListId(list._id);
		setEditingName(list.name);
	};

	// Save edited name
	const saveEditedName = async (listId) => {
		if (!editingName.trim()) {
			setEditingListId(null);
			return;
		}
		try {
			await updateTrickList(listId, editingName, token);
			setEditingListId(null);
			fetchMyLists();
		} catch (error) {
			console.error("Error updating list:", error);
			alert("Failed to update list");
		}
	};

	// Cancel editing
	const cancelEditing = () => {
		setEditingListId(null);
		setEditingName("");
	};

	// Toggle list visibility (public/private)
	const handleToggleVisibility = async (list) => {
		try {
			await toggleTrickListPublic(list._id, !list.isPublic, token);
			// Update local state optimistically
			setMyLists((prev) =>
				prev.map((l) =>
					l._id === list._id ? { ...l, isPublic: !l.isPublic } : l
				)
			);
		} catch (error) {
			console.error("Error toggling visibility:", error);
			alert("Failed to update visibility");
		}
	};

	// Render Trickipedia content
	const renderTrickipediaContent = () => (
		<>
			{/* Search Bar */}
			<div className="mb-6">
				<div className="relative">
					<Search
						className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-opacity duration-200 ${
							searchFocused || searchTerm ? 'opacity-0' : 'opacity-100'
						}`}
					/>
					<Input
						type="text"
						placeholder={searchFocused || searchTerm ? "" : "Search tricks..."}
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						onFocus={() => setSearchFocused(true)}
						onBlur={() => setSearchFocused(false)}
						className={`bg-background border-input focus:border-yellow-500 transition-all duration-200 ${
							searchFocused || searchTerm ? 'pl-4' : 'pl-10'
						}`}
					/>
				</div>
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-24">
					<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
				</div>
			) : (
				<>
					{/* Results Count */}
					<div className="mb-4 text-sm text-muted-foreground">
						Showing {paginatedTricks.length} of {filteredTricks.length} tricks
					</div>

					{/* Tricks Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
						{paginatedTricks.map((trick) => (
							<TrickCard
								key={trick.id}
								id={trick.id}
								name={trick.name}
								category={trick.category}
								difficulty={trick.difficulty}
								description={trick.description}
								images={trick.images}
								url={`/trickipedia/${trick.category?.toLowerCase() || "skateboarding"}/${trick.url || trick.id}`}
							/>
						))}
					</div>

					{/* No Results */}
					{filteredTricks.length === 0 && (
						<div className="text-center py-24">
							<BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
							<h2 className="text-xl font-semibold text-foreground mb-2">
								No tricks found
							</h2>
							<p className="text-muted-foreground">
								Try adjusting your search or category filter.
							</p>
						</div>
					)}

					{/* Pagination */}
					{totalPages > 1 && (
						<div className="mt-8">
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
											disabled={currentPage === 1}
											className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
										/>
									</PaginationItem>

									{[...Array(totalPages)].map((_, i) => {
										const page = i + 1;
										// Show first, last, and pages around current
										if (
											page === 1 ||
											page === totalPages ||
											(page >= currentPage - 1 && page <= currentPage + 1)
										) {
											return (
												<PaginationItem key={page}>
													<PaginationLink
														onClick={() => setCurrentPage(page)}
														isActive={currentPage === page}
														className="cursor-pointer"
													>
														{page}
													</PaginationLink>
												</PaginationItem>
											);
										}
										return null;
									})}

									<PaginationItem>
										<PaginationNext
											onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
											disabled={currentPage === totalPages}
											className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</div>
					)}
				</>
			)}
		</>
	);

	// Render My Trick Lists content
	const renderMyListsContent = () => {
		if (!loggedIn) {
			return (
				<div className="text-center py-24">
					<Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-foreground mb-2">
						Sign in to view your lists
					</h2>
					<p className="text-muted-foreground mb-6">
						Create and manage your personal trick lists.
					</p>
					<Button
						onClick={() => router.push("/login")}
						className="bg-yellow-500 text-black hover:bg-yellow-400"
					>
						Sign In
					</Button>
				</div>
			);
		}

		return (
			<>
				{/* Header with Create Button */}
				<div className="flex items-center justify-between mb-6">
					<div>
						<h2 className="text-xl font-semibold text-foreground">My Trick Lists</h2>
						<p className="text-sm text-muted-foreground mt-1">
							{myLists.length} list{myLists.length !== 1 ? "s" : ""}
						</p>
					</div>
					<Button
						onClick={() => setCreateDialogOpen(true)}
						className="bg-yellow-500 text-black hover:bg-yellow-400"
					>
						<Plus className="h-4 w-4 mr-2" />
						New List
					</Button>
				</div>

				{listsLoading ? (
					<div className="flex items-center justify-center py-24">
						<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
					</div>
				) : myLists.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
						{myLists.map((list) => (
							<Card
								key={list._id}
								className="group hover:border-yellow-500 transition-colors cursor-pointer"
								onClick={() => router.push(`/trickbook/my-lists/${list._id}`)}
							>
								<CardHeader className="pb-2">
									{editingListId === list._id ? (
										<div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
											<Input
												value={editingName}
												onChange={(e) => setEditingName(e.target.value)}
												className="h-8"
												autoFocus
												onClick={(e) => e.stopPropagation()}
											/>
											<Button
												size="icon"
												variant="ghost"
												onClick={(e) => {
													e.stopPropagation();
													saveEditedName(list._id);
												}}
												className="h-8 w-8"
											>
												<Check className="h-4 w-4 text-green-500" />
											</Button>
											<Button
												size="icon"
												variant="ghost"
												onClick={(e) => {
													e.stopPropagation();
													cancelEditing();
												}}
												className="h-8 w-8"
											>
												<X className="h-4 w-4 text-red-500" />
											</Button>
										</div>
									) : (
										<div className="flex items-center justify-between">
											<CardTitle className="text-lg group-hover:text-yellow-500 transition-colors">
												{list.name}
											</CardTitle>
											<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
												<Button
													size="icon"
													variant="ghost"
													onClick={(e) => {
														e.stopPropagation();
														startEditing(list);
													}}
													className="h-8 w-8"
												>
													<Edit2 className="h-4 w-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													onClick={(e) => {
														e.stopPropagation();
														setListToDelete(list);
														setDeleteDialogOpen(true);
													}}
													className="h-8 w-8 text-red-500 hover:text-red-600"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</div>
									)}
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between text-sm text-muted-foreground">
										<span>{list.tricks?.length || 0} tricks</span>
										<Badge
											variant="secondary"
											className="cursor-pointer hover:bg-yellow-500/20 transition-colors"
											onClick={(e) => {
												e.stopPropagation();
												handleToggleVisibility(list);
											}}
											title={`Click to make ${list.isPublic ? "private" : "public"}`}
										>
											{list.isPublic ? (
												<>
													<Globe className="h-3 w-3 mr-1" />
													Public
												</>
											) : (
												<>
													<Lock className="h-3 w-3 mr-1" />
													Private
												</>
											)}
										</Badge>
									</div>
									{list.tricks?.length > 0 && (() => {
									// Calculate completed count - checked is a string, "To Do" means incomplete
									const completedTricks = list.tricks.filter(trick => trick.checked && trick.checked !== 'To Do').length;
									return (
										<div className="mt-2">
											<div className="h-1.5 bg-muted rounded-full overflow-hidden">
												<div
													className="h-full bg-yellow-500 rounded-full transition-all"
													style={{
														width: `${(completedTricks / list.tricks.length) * 100}%`,
													}}
												/>
											</div>
											<p className="text-xs text-muted-foreground mt-1">
												{completedTricks} / {list.tricks.length} completed
											</p>
										</div>
									);
								})()}
								</CardContent>
							</Card>
						))}
					</div>
				) : (
					<div className="text-center py-24">
						<BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-foreground mb-2">
							No trick lists yet
						</h2>
						<p className="text-muted-foreground mb-6">
							Create your first trick list to start tracking your progress.
						</p>
						<Button
							onClick={() => setCreateDialogOpen(true)}
							className="bg-yellow-500 text-black hover:bg-yellow-400"
						>
							<Plus className="h-4 w-4 mr-2" />
							Create Your First List
						</Button>
					</div>
				)}
			</>
		);
	};

	// Render Homie Trick Lists content
	const renderHomieListsContent = () => (
		<>
			<div className="mb-6">
				<h2 className="text-xl font-semibold text-foreground">Homie Trick Lists</h2>
				<p className="text-sm text-muted-foreground mt-1">
					Discover what tricks other riders are learning
				</p>
			</div>

			{homieListsLoading ? (
				<div className="flex items-center justify-center py-24">
					<Loader2 className="h-8 w-8 animate-spin text-yellow-500" />
				</div>
			) : homieLists.length > 0 ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{homieLists.map((list) => (
						<Card
							key={list._id}
							className="hover:border-yellow-500 transition-colors cursor-pointer"
						>
							<CardHeader className="pb-2">
								<div className="flex items-center justify-between">
									<CardTitle className="text-lg">{list.name}</CardTitle>
									<Badge variant="outline" className="text-yellow-500 border-yellow-500/50">
										<Globe className="h-3 w-3 mr-1" />
										Public
									</Badge>
								</div>
							</CardHeader>
							<CardContent>
								<div className="text-sm text-muted-foreground">
									<span>{list.tricks?.length || 0} tricks</span>
								</div>
								{list.user && (
									<p className="text-xs text-muted-foreground mt-2">
										by {list.user.name || "Anonymous"}
									</p>
								)}
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				<div className="text-center py-24">
					<Globe className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
					<h2 className="text-xl font-semibold text-foreground mb-2">
						No public lists yet
					</h2>
					<p className="text-muted-foreground">
						Be the first to share a public trick list with the community!
					</p>
				</div>
			)}
		</>
	);

	return (
		<>
			<Head>
				<title>TrickBook | The Trick Book</title>
				<link rel="icon" href="/favicon.png" />
				<meta name="description" content="The Trick Book - Learn tricks, manage your lists, and discover what your homies are learning" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="robots" content="index, follow" />
				<link rel="canonical" href="https://thetrickbook.com/trickbook" />
			</Head>

			<div className="min-h-screen bg-background flex items-start">
				{/* Sidebar */}
				<TrickipediaSidebar
					selectedCategory={selectedCategory}
					onCategoryChange={handleCategoryChange}
					activeTab={activeTab}
					onTabChange={handleTabChange}
				/>

				{/* Main Content */}
				<main className="flex-1 p-6 min-h-screen">
					<div className="max-w-7xl mx-auto">
						{activeTab === "trickipedia" && renderTrickipediaContent()}
						{activeTab === "my-lists" && renderMyListsContent()}
						{activeTab === "homie-lists" && renderHomieListsContent()}
					</div>
				</main>
			</div>

			{/* Create List Dialog */}
			<Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Create New Trick List</DialogTitle>
						<DialogDescription>
							Give your new trick list a name.
						</DialogDescription>
					</DialogHeader>
					<div className="py-4">
						<Input
							placeholder="List name..."
							value={newListName}
							onChange={(e) => setNewListName(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={handleCreateList}
							disabled={creating || !newListName.trim()}
							className="bg-yellow-500 text-black hover:bg-yellow-400"
						>
							{creating ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Create"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete List Dialog */}
			<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete Trick List</DialogTitle>
						<DialogDescription>
							Are you sure you want to delete &quot;{listToDelete?.name}&quot;? This action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={handleDeleteList}
							disabled={deleting}
						>
							{deleting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								"Delete"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
