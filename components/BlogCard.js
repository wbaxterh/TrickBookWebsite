import Link from "next/link";
import Image from "next/image";
import { Typography } from "@mui/material";

export default function BlogCard({ id, firstImage, title, date, author }) {
	return (
		<Link href={`/blog/${id}`} passHref style={{ textDecoration: "none" }}>
			<div className='card d-flex'>
				{firstImage && (
					<div
						style={{
							position: "relative",
							height: "200px",
						}}
					>
						<Image
							className='rounded-top'
							src={firstImage}
							alt={`${title}`}
							layout='fill'
							objectFit='cover'
						/>
					</div>
				)}
				<div className='card-body app-secondary-bg rounded-bottom'>
					<Typography variant='h5' className='card-title app-primary'>
						{title}
					</Typography>
					<Typography className='card-text text-light' variant='body1'>
						{date}
					</Typography>
					<Typography className='card-text text-light' variant='body1'>
						By {author}
					</Typography>
				</div>
			</div>
		</Link>
	);
}
