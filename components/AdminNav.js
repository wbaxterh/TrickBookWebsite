import { Button, Box } from "@mui/material";
import { useRouter } from "next/router";

export default function AdminNav() {
	const router = useRouter();
	const currentPath = router.pathname;

	const navItems = [
		{ label: "Dashboard", path: "/admin" },
		{ label: "Categories", path: "/admin/categories" },
		{ label: "Trickipedia", path: "/admin/trickipedia" },
		{ label: "Blog", path: "/admin/blog" },
	];

	return (
		<Box sx={{ mb: 3, display: "flex", gap: 1, flexWrap: "wrap" }}>
			{navItems.map((item) => (
				<Button
					key={item.path}
					variant={currentPath === item.path ? "contained" : "outlined"}
					color='primary'
					onClick={() => router.push(item.path)}
					sx={{ minWidth: "120px" }}
				>
					{item.label}
				</Button>
			))}
		</Box>
	);
}
