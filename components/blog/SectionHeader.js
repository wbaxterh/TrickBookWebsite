import PropTypes from 'prop-types';
import styles from '../../styles/blog.module.css';

export default function SectionHeader({ eyebrow, title, description, headingId, align, className }) {
  const classes = [styles.sectionHeader, styles[`sectionHeader${align}`], className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {eyebrow ? <p className={styles.sectionHeaderEyebrow}>{eyebrow}</p> : null}
      <h2 id={headingId} className={styles.sectionHeaderTitle}>
        {title}
      </h2>
      {description ? <p className={styles.sectionHeaderDescription}>{description}</p> : null}
    </div>
  );
}

SectionHeader.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  headingId: PropTypes.string,
  align: PropTypes.oneOf(['Left', 'Center']),
  className: PropTypes.string,
};

SectionHeader.defaultProps = {
  eyebrow: null,
  description: null,
  headingId: undefined,
  align: 'Left',
  className: '',
};
