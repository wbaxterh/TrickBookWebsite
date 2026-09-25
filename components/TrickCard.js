import { Chip, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import styles from '../styles/trickipedia.module.css';

export default function TrickCard({ id, name, category, difficulty, description, images, url }) {
  const difficultyColors = {
    Beginner: 'success',
    Intermediate: 'warning',
    Advanced: 'error',
    Expert: 'secondary',
  };

  return (
    <Link href={url} passHref style={{ textDecoration: 'none' }}>
      <div className={`relative flex min-w-0 flex-col rounded-md ${styles.trickCard}`}>
        {images?.[0] && images[0].length > 0 && (
          <div className={styles.trickImageContainer}>
            <Image
              className="rounded-t-md"
              src={images[0]}
              alt={`${name}`}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={images[0]?.includes('s3.amazonaws.com')}
            />
          </div>
        )}
        <div className="flex-auto rounded-b-md p-4 app-secondary-bg">
          <Typography variant="h5" className="mb-2 app-primary">
            {name}
          </Typography>
          <div className="mb-2 flex gap-2">
            <Chip label={category} size="small" color="primary" variant="outlined" />
            <Chip
              label={difficulty}
              size="small"
              color={difficultyColors[difficulty] || 'default'}
            />
          </div>
          <Typography className="text-[#f8f9fa]" variant="body2">
            {description?.substring(0, 150)}...
          </Typography>
        </div>
      </div>
    </Link>
  );
}
