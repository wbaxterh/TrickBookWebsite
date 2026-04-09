import Link from 'next/link';
import PropTypes from 'prop-types';
import styles from '../../styles/blog.module.css';

export default function PostFooterCTA({
  eyebrow,
  title,
  body,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  className,
}) {
  const classes = [styles.postFooterCta, className].filter(Boolean).join(' ');

  return (
    <section className={classes}>
      <div className={styles.postFooterCtaCopy}>
        {eyebrow ? <p className={styles.postFooterCtaEyebrow}>{eyebrow}</p> : null}
        <h2 className={styles.postFooterCtaTitle}>{title}</h2>
        {body ? <p className={styles.postFooterCtaBody}>{body}</p> : null}
      </div>
      <div className={styles.postFooterCtaActions}>
        <Link href={primaryHref} className={styles.postFooterCtaPrimary}>
          {primaryLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className={styles.postFooterCtaSecondary}>
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </section>
  );
}

PostFooterCTA.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  body: PropTypes.string,
  primaryLabel: PropTypes.string,
  primaryHref: PropTypes.string,
  secondaryLabel: PropTypes.string,
  secondaryHref: PropTypes.string,
  className: PropTypes.string,
};

PostFooterCTA.defaultProps = {
  eyebrow: 'Keep Riding',
  body: null,
  primaryLabel: 'Explore more posts',
  primaryHref: '/blog',
  secondaryLabel: null,
  secondaryHref: null,
  className: '',
};
