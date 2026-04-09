import PropTypes from 'prop-types';
import styles from '../../styles/blog.module.css';

export default function DataBlock({ title, description, items, className }) {
  const classes = [styles.dataBlock, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      {title ? <h3 className={styles.dataBlockTitle}>{title}</h3> : null}
      {description ? <p className={styles.dataBlockDescription}>{description}</p> : null}
      <dl className={styles.dataBlockGrid}>
        {items.map((item) => (
          <div key={`${item.label}-${item.value}`} className={styles.dataBlockItem}>
            <dt className={styles.dataBlockLabel}>{item.label}</dt>
            <dd className={styles.dataBlockValue}>{item.value}</dd>
            {item.note ? <p className={styles.dataBlockNote}>{item.note}</p> : null}
          </div>
        ))}
      </dl>
    </section>
  );
}

DataBlock.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      note: PropTypes.string,
    }),
  ).isRequired,
  className: PropTypes.string,
};

DataBlock.defaultProps = {
  title: null,
  description: null,
  className: '',
};
