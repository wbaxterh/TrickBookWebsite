import { useRouter } from "next/router";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Typography, Chip, Container, Box } from "@mui/material";
import PageHeader from "../../../components/PageHeader";
import styles from "../../../styles/trickipedia.module.css";
import { getSortedTricksData } from "../../../lib/apiTrickipedia";

export default function TrickDetailPage() {
	const router = useRouter();
	const { category, trick } = router.query;
	const [trickData, setTrickData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!category || !trick) return;
		const fetchTrick = async () => {
			const tricks = await getSortedTricksData(
				category.charAt(0).toUpperCase() + category.slice(1)
			);
			const found = tricks.find((t) => t.url === trick || t.id === trick);
			setTrickData(found || null);
			setLoading(false);
		};
		fetchTrick();
	}, [category, trick]);

	if (loading) {
		return <Typography variant='h5'>Loading...</Typography>;
	}

	if (!trickData) {
		return (
			<Container className='py-5'>
				<Typography variant='h2' color='error' align='center'>
					404
				</Typography>
				<Typography variant='h5' align='center'>
					This trick could not be found.
				</Typography>
			</Container>
		);
	}

	return (
		<>
			<Head>
				<title>{trickData.name} - The Trick Book</title>
				<meta name='description' content={trickData.description} />
			</Head>
			<Container
				maxWidth='md'
				sx={{ maxWidth: 700, px: { xs: 2, md: 4 }, py: 4 }}
			>
				<div className={styles.trickipediaContainer} style={{ padding: 0 }}>
					<PageHeader title={trickData.name} col='col-sm-4' />
					<Box className='my-4' display='flex' gap={2}>
						<Chip label={trickData.category} color='primary' className='me-2' />
						<Chip label={trickData.difficulty} color='secondary' />
					</Box>
					<Typography variant='h5' className='mb-3'>
						{trickData.description}
					</Typography>
					{trickData.images && trickData.images.length > 0 && (
						<img
							src={trickData.images[0]}
							alt={trickData.name}
							style={{
								display: "block",
								maxWidth: 400,
								width: "100%",
								borderRadius: 8,
								margin: "24px auto",
							}}
						/>
					)}
					<Box className='mb-4'>
						<Typography variant='h6'>Steps:</Typography>
						<ol>
							{trickData.steps &&
								trickData.steps.map((step, idx) => <li key={idx}>{step}</li>)}
						</ol>
					</Box>
					{trickData.videoUrl && (
						<Box className='mb-4'>
							<Typography variant='h6'>Video Tutorial:</Typography>
							<a
								href={trickData.videoUrl}
								target='_blank'
								rel='noopener noreferrer'
							>
								{trickData.videoUrl}
							</a>
						</Box>
					)}
					{trickData.source && (
						<Typography variant='body2' color='textSecondary'>
							Source: {trickData.source}
						</Typography>
					)}
				</div>
			</Container>
		</>
	);
}
