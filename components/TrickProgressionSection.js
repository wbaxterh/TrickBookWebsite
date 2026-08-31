import { ArrowForward, CheckCircleOutline, SchoolOutlined } from '@mui/icons-material';
import { Box, Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import { useRouter } from 'next/router';
import styles from '../styles/trickipedia.module.css';

const iconFor = (kind) => (kind === 'foundations' ? <SchoolOutlined /> : <ArrowForward />);

export default function TrickProgressionSection({ title, kind, edges = [] }) {
  const router = useRouter();
  if (!edges.length) return null;

  return (
    <Box
      component="section"
      className={styles.progressionSection}
      aria-labelledby={`${kind}-title`}
    >
      <Box className={styles.sectionHeading}>
        {iconFor(kind)}
        <Typography id={`${kind}-title`} variant="h5" component="h2">
          {title}
        </Typography>
      </Box>
      <Box className={styles.progressionGrid}>
        {edges.map((edge) => (
          <Card key={`${kind}-${edge.trick._id}`} className={styles.progressionCard}>
            <CardActionArea
              onClick={() =>
                router.push(
                  `/trickipedia/${edge.trick.category.toLowerCase()}/${edge.trick.url || edge.trick._id}`,
                )
              }
              aria-label={`${edge.trick.name}: ${edge.reason}`}
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" gap={1} alignItems="center">
                  <Typography variant="h6" component="h3">
                    {edge.trick.name}
                  </Typography>
                  {edge.strength && <Chip size="small" label={edge.strength} />}
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {edge.reason}
                </Typography>
                <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 1.5 }}>
                  <CheckCircleOutline fontSize="small" />
                  <Typography variant="caption">Why this connects</Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
