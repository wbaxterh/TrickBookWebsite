import PropTypes from 'prop-types';
import styles from '../../styles/blog.module.css';

export default function FigureWithCaption({ src, alt, caption, className }) {
  const classes = [styles.figureWithCaption, className].filter(Boolean).join(' ');
  const resolvedAlt = alt || caption || 'Blog article image';

  return (
    <figure className={classes}>
      <img src={src} alt={resolvedAlt} className={styles.figureImage} />
      {caption ? <figcaption className={styles.figureCaption}>{caption}</figcaption> : null}
    </figure>
  );
}

FigureWithCaption.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  caption: PropTypes.string,
  className: PropTypes.string,
};

FigureWithCaption.defaultProps = {
  alt: null,
  caption: null,
  className: '',
};
