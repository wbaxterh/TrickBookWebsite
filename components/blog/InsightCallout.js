import PropTypes from 'prop-types';
import styles from '../../styles/blog.module.css';

const toneClassNames = {
  info: styles.insightCalloutInfo,
  success: styles.insightCalloutSuccess,
  warning: styles.insightCalloutWarning,
};

export default function InsightCallout({ title, body, tone, children, className }) {
  const classes = [styles.insightCallout, toneClassNames[tone], className].filter(Boolean).join(' ');

  return (
    <aside className={classes}>
      {title ? <h3 className={styles.insightCalloutTitle}>{title}</h3> : null}
      {body ? <p className={styles.insightCalloutBody}>{body}</p> : null}
      {children}
    </aside>
  );
}

InsightCallout.propTypes = {
  title: PropTypes.string,
  body: PropTypes.string,
  tone: PropTypes.oneOf(['info', 'success', 'warning']),
  children: PropTypes.node,
  className: PropTypes.string,
};

InsightCallout.defaultProps = {
  title: null,
  body: null,
  tone: 'info',
  children: null,
  className: '',
};
