import Link from "next/link";
import Image from "next/image";
import { Typography, Chip } from "@mui/material";
import styles from "../styles/trickipedia.module.css";

export default function TrickCard({
	id,
	name,
	category,
	difficulty,
	description,
	images,
	url,
}) {
	const difficultyColors = {
		Beginner: "success",
		Intermediate: "warning",
		Advanced: "error",
		Expert: "secondary",
	};

	return (
		<Link href={url} passHref style={{ textDecoration: "none" }}>
			<div className={`card ${styles.trickCard}`}>
				{images && images[0] && (
					<div className={styles.trickImageContainer}>
						<Image
							className='rounded-top'
							src={images[0]}
							alt={`${name}`}
							layout='fill'
							objectFit='cover'
						/>
					</div>
				)}
				<div className='card-body app-secondary-bg rounded-bottom'>
					<Typography variant='h5' className='card-title app-primary'>
						{name}
					</Typography>
					<div className='d-flex gap-2 mb-2'>
						<Chip
							label={category}
							size='small'
							color='primary'
							variant='outlined'
						/>
						<Chip
							label={difficulty}
							size='small'
							color={difficultyColors[difficulty] || "default"}
						/>
					</div>
					<Typography className='card-text text-light' variant='body2'>
						{description?.substring(0, 150)}...
					</Typography>
				</div>
			</div>
		</Link>
	);
}
