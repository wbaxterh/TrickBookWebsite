import { Typography } from '@mui/material';
import PropTypes from 'prop-types';
import styles from '../styles/blog.module.css'; // Assuming the styles file is in the same location

const PageHeader = ({ title, className, sx, col, heroImage, author, date }) => {
  const imageSrc = heroImage || '/defaultBlogBG.png';

  return (
    <div className={`row ${className}`}>
      <div className={`${col} p-0`}>
        <div className={`position-relative ${styles.heroImageContainer}`}>
          <img src={imageSrc} alt={`${title} Hero Image`} className={styles.heroImage} />
          <div className={styles.overlay}>
            <Typography variant="h2" className={`header-text ${styles.headerText}`} sx={{ ...sx }}>
              {title}
            </Typography>
            {author && date && (
              <Typography variant="subtitle1" className={styles.authorDate}>
                By {author} on {new Date(date).toLocaleDateString()}
              </Typography>
            )}
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
};

PageHeader.defaultProps = {
  className: '',
  sx: {},
  col: 'col-sm',
  heroImage: null,
  author: null,
  date: null,
};

export default PageHeader;
