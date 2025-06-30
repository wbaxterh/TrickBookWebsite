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
					onClick={() => router.push(item.path)}
					sx={{
						minWidth: "120px",
						backgroundColor:
							currentPath === item.path ? "#FFF000" : "transparent",
						color: currentPath === item.path ? "#1f1f1f" : "#1f1f1f",
						borderColor: "#FFF000",
						"&:hover": {
							backgroundColor: "#FFF000",
							color: "#1f1f1f",
						},
					}}
				>
					{item.label}
				</Button>
			))}
		</Box>
	);
}
