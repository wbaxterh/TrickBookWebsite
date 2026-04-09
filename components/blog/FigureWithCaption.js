import PropTypes from 'prop-types';
import styles from '../../styles/blog.module.css';

export default function FigureWithCaption({ src, alt, caption, className }) {
  const classes = [styles.figureWithCaption, className].filter(Boolean).join(' ');

  return (
    <figure className={classes}>
      <img src={src} alt={alt} className={styles.figureImage} />
      {caption ? <figcaption className={styles.figureCaption}>{caption}</figcaption> : null}
    </figure>
  );
}

FigureWithCaption.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  caption: PropTypes.string,
  className: PropTypes.string,
};

FigureWithCaption.defaultProps = {
  caption: null,
  className: '',
};
