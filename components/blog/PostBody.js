import PropTypes from 'prop-types';
import styles from '../../styles/blog.module.css';

const measureClassNames = {
  narrow: styles.postBodyNarrow,
  body: styles.postBodyBody,
  wide: styles.postBodyWide,
};

export default function PostBody({ html, children, measure, className }) {
  const classes = [styles.postBody, measureClassNames[measure], className].filter(Boolean).join(' ');

  if (html) {
    return <article className={classes} dangerouslySetInnerHTML={{ __html: html }} />;
  }

  return <article className={classes}>{children}</article>;
}

PostBody.propTypes = {
  html: PropTypes.string,
  children: PropTypes.node,
  measure: PropTypes.oneOf(['narrow', 'body', 'wide']),
  className: PropTypes.string,
};

PostBody.defaultProps = {
  html: null,
  children: null,
  measure: 'body',
  className: '',
};
