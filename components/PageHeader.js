import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import styles from '../styles/blog.module.css';

const PageHeader = ({ title, className, sx, col, heroImage, author, date, readingTime }) => {
  const imageSrc = heroImage || '/defaultBlogBG.png';

  return (
    <div className={`row ${className}`}>
      <div className={`${col} p-0`}>
        <div className={`position-relative ${styles.heroImageContainer}`}>
          <img src={imageSrc} alt={`${title}`} className={styles.heroImage} />
          <div className={styles.overlay}>
            <Typography variant="h2" className={`header-text ${styles.headerText}`} sx={{ ...sx }}>
              {title}
            </Typography>
            {author && date && (
              <Typography variant="subtitle1" className={styles.authorDate}>
                By {author} on {new Date(date).toLocaleDateString()}
              </Typography>
            )}
            {readingTime && <div className={styles.readingTime}>{readingTime} min read</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  className: PropTypes.string,
  sx: PropTypes.object,
  col: PropTypes.string,
  heroImage: PropTypes.string,
  author: PropTypes.string,
  date: PropTypes.string,
  readingTime: PropTypes.number,
};

PageHeader.defaultProps = {
  className: '',
  sx: {},
  col: 'col-sm',
  heroImage: null,
  author: null,
  date: null,
  readingTime: null,
};

export default PageHeader;
