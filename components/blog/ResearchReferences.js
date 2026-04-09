import PropTypes from 'prop-types';
import SectionHeader from './SectionHeader';
import styles from '../../styles/blog.module.css';

export default function ResearchReferences({ title, description, references, className }) {
  const classes = [styles.researchReferences, className].filter(Boolean).join(' ');

  return (
    <section className={classes} aria-labelledby="research-references-heading">
      <SectionHeader
        eyebrow="Research"
        title={title}
        description={description}
        headingId="research-references-heading"
        className={styles.researchReferencesHeader}
      />
      <ol className={styles.researchReferencesList}>
        {references.map((reference) => (
          <li
            key={`${reference.title}-${reference.url || reference.publisher}`}
            className={styles.researchReferencesItem}
          >
            <p className={styles.researchReferencesTitle}>
              {reference.url ? (
                <a href={reference.url} target="_blank" rel="noreferrer">
                  {reference.title}
                </a>
              ) : (
                reference.title
              )}
            </p>
            {reference.publisher ? (
              <p className={styles.researchReferencesMeta}>{reference.publisher}</p>
            ) : null}
            {reference.note ? <p className={styles.researchReferencesNote}>{reference.note}</p> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}

ResearchReferences.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  references: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      url: PropTypes.string,
      publisher: PropTypes.string,
      note: PropTypes.string,
    }),
  ).isRequired,
  className: PropTypes.string,
};

ResearchReferences.defaultProps = {
  title: 'References',
  description: null,
  className: '',
};
