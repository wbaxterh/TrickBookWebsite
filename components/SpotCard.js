import Link from "next/link";
import Image from "next/image";
import { Typography, Chip } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import styles from "../styles/spots.module.css";

export default function SpotCard({
	id,
	name,
	city,
	state,
	imageURL,
	description,
	tags,
	rating,
}) {
	// Parse tags if it's a string
	const tagList = tags
		? typeof tags === "string"
			? tags.split(",").map((t) => t.trim()).filter(Boolean)
			: tags
		: [];

	// Generate URL-friendly slug from spot name
	const spotSlug = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");

	const spotUrl = `/spots/${state?.toLowerCase() || "unknown"}/${spotSlug}?id=${id}`;

	return (
		<Link href={spotUrl} passHref style={{ textDecoration: "none" }}>
			<div className={`card ${styles.spotCard}`}>
				<div className={styles.spotImageContainer}>
					{imageURL ? (
						<Image
							className="rounded-top"
							src={imageURL}
							alt={name}
							fill
							style={{ objectFit: "cover" }}
							unoptimized
						/>
					) : (
						<div className={styles.noImage}>
							<LocationOnIcon sx={{ fontSize: 60, color: "#fff000" }} />
						</div>
					)}
				</div>
				<div className="card-body app-secondary-bg rounded-bottom">
					<Typography variant="h6" className="card-title app-primary">
						{name}
					</Typography>
					<div className="d-flex align-items-center gap-1 mb-2">
						<LocationOnIcon sx={{ fontSize: 16, color: "#aaa" }} />
						<Typography variant="body2" className="text-light">
							{city && state ? `${city}, ${state}` : state || "Unknown location"}
						</Typography>
					</div>
					{tagList.length > 0 && (
						<div className="d-flex gap-1 mb-2 flex-wrap">
							{tagList.slice(0, 3).map((tag, index) => (
								<Chip
									key={index}
									label={tag}
									size="small"
									variant="outlined"
									sx={{
										color: "#fff000",
										borderColor: "#fff000",
										fontSize: "0.7rem",
									}}
								/>
							))}
							{tagList.length > 3 && (
								<Chip
									label={`+${tagList.length - 3}`}
									size="small"
									sx={{
										color: "#aaa",
										fontSize: "0.7rem",
									}}
								/>
							)}
						</div>
					)}
					{description && (
						<Typography className="card-text text-light" variant="body2">
							{description.substring(0, 100)}
							{description.length > 100 ? "..." : ""}
						</Typography>
					)}
				</div>
			</div>
		</Link>
	);
}
