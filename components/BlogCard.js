import { Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';

export default function BlogCard({ id, firstImage, title, date, author }) {
  return (
    <Link href={`/blog/${id}`} passHref style={{ textDecoration: 'none' }}>
      <div className="relative flex min-w-0 flex-col rounded-md border border-black/[0.175] bg-inherit dark:border-[#333] dark:bg-[#1e1e1e]">
        {firstImage && (
          <div
            style={{
              position: 'relative',
              height: '200px',
            }}
          >
            <Image
              className="rounded-t-md"
              src={firstImage}
              alt={`${title}`}
              fill
              style={{ objectFit: 'cover' }}
              unoptimized={firstImage?.includes('s3.amazonaws.com')}
            />
          </div>
        )}
        <div className="flex-auto rounded-b-md p-4 app-secondary-bg">
          <Typography variant="h5" className="mb-2 app-primary">
            {title}
          </Typography>
          <Typography className="text-[#f8f9fa]" variant="body1">
            {date}
          </Typography>
          <Typography className="text-[#f8f9fa]" variant="body1">
            By {author}
          </Typography>
        </div>
      </div>
    </Link>
  );
}
