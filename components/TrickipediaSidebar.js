import React, { useState, useEffect } from "react";
import { BookOpen, List, Users, Menu, X } from "lucide-react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import { getCategories } from "../lib/api";

export default function TrickipediaSidebar({
	selectedCategory,
	onCategoryChange,
	activeTab,
	onTabChange,
}) {
	const [categories, setCategories] = useState([]);
	const [mobileOpen, setMobileOpen] = useState(false);

	useEffect(() => {
		const fetchCategories = async () => {
			const data = await getCategories();
			setCategories(data);
		};
		fetchCategories();
	}, []);

	// Close mobile menu when tab changes
	const handleTabChange = (tab) => {
		onTabChange(tab);
		setMobileOpen(false);
	};

	// Close mobile menu when category changes
	const handleCategoryChange = (category) => {
		onCategoryChange(category);
		setMobileOpen(false);
	};

	const sidebarContent = (
		<>
			{/* Category Dropdown */}
			<div>
				<label className="text-sm font-medium text-muted-foreground mb-2 block">
					Category
				</label>
				<Select value={selectedCategory} onValueChange={handleCategoryChange}>
					<SelectTrigger className="w-full bg-background border-yellow-500/50 hover:border-yellow-500">
						<SelectValue placeholder="All Categories" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Categories</SelectItem>
						{categories.map((category) => (
							<SelectItem
								key={category._id}
								value={category.name.toLowerCase()}
							>
								{category.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Navigation Tabs */}
			<div>
				<label className="text-sm font-medium text-muted-foreground mb-2 block">
					Browse
				</label>
				<Tabs
					value={activeTab}
					onValueChange={handleTabChange}
					orientation="vertical"
					className="w-full"
				>
					<TabsList className="flex flex-col w-full gap-1 bg-transparent p-0">
						<TabsTrigger
							value="trickipedia"
							className="w-full justify-start gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
						>
							<BookOpen className="h-4 w-4" />
							Trickipedia
						</TabsTrigger>
						<TabsTrigger
							value="my-lists"
							className="w-full justify-start gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
						>
							<List className="h-4 w-4" />
							My Trick Lists
						</TabsTrigger>
						<TabsTrigger
							value="homie-lists"
							className="w-full justify-start gap-2 data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
						>
							<Users className="h-4 w-4" />
							Homie Trick Lists
						</TabsTrigger>
					</TabsList>
				</Tabs>
			</div>

			{/* Info Section */}
			<div className="mt-auto pt-4 border-t border-border">
				<p className="text-xs text-muted-foreground">
					Browse tricks from the Trickipedia, manage your personal trick lists,
					or discover what your homies are learning.
				</p>
			</div>
		</>
	);

	return (
		<>
			{/* Mobile Menu Button */}
			<Button
				variant="outline"
				size="icon"
				className="fixed top-20 left-4 z-50 lg:hidden bg-background border-yellow-500/50"
				onClick={() => setMobileOpen(!mobileOpen)}
			>
				{mobileOpen ? (
					<X className="h-5 w-5" />
				) : (
					<Menu className="h-5 w-5" />
				)}
			</Button>

			{/* Mobile Overlay */}
			{mobileOpen && (
				<div
					className="fixed inset-0 bg-black/50 z-40 lg:hidden"
					onClick={() => setMobileOpen(false)}
				/>
			)}

			{/* Mobile Sidebar */}
			<div
				className={`fixed top-0 left-0 h-full w-64 bg-card border-r border-border p-4 pt-20 flex flex-col gap-6 z-50 transform transition-transform duration-300 lg:hidden ${
					mobileOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{sidebarContent}
			</div>

			{/* Desktop Sidebar */}
			<aside className="hidden lg:flex w-64 flex-shrink-0 bg-card border-r border-border p-4 flex-col gap-6 sticky top-0 h-screen overflow-y-auto self-start">
				{sidebarContent}
			</aside>
		</>
	);
}
