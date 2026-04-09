import PropTypes from 'prop-types';
import styles from '../../styles/blog.module.css';

export default function PostHero({
  title,
  deck,
  author,
  date,
  readingTime,
  imageSrc,
  imageAlt,
}) {
  const hasMeta = author || date || readingTime;

  return (
    <header className={styles.postHero}>
      <div className={styles.postHeroMedia}>
        <img src={imageSrc} alt={imageAlt || title} className={styles.postHeroImage} />
        <div className={styles.postHeroScrim} />
      </div>
      <div className={styles.postHeroContent}>
        <h1 className={styles.postHeroTitle}>{title}</h1>
        {deck ? <p className={styles.postHeroDeck}>{deck}</p> : null}
        {hasMeta ? (
          <div className={styles.postHeroMeta}>
            {author ? <span>By {author}</span> : null}
            {date ? <span>{new Date(date).toLocaleDateString()}</span> : null}
            {readingTime ? <span>{readingTime} min read</span> : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}

PostHero.propTypes = {
  title: PropTypes.string.isRequired,
  deck: PropTypes.string,
  author: PropTypes.string,
  date: PropTypes.string,
  readingTime: PropTypes.number,
  imageSrc: PropTypes.string,
  imageAlt: PropTypes.string,
};

PostHero.defaultProps = {
  deck: null,
  author: null,
  date: null,
  readingTime: null,
  imageSrc: '/defaultBlogBG.png',
  imageAlt: null,
};
