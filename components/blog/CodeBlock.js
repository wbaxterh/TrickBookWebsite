import PropTypes from 'prop-types';
import styles from '../../styles/blog.module.css';

export default function CodeBlock({ code, language, caption }) {
  const languageLabel = language ? language.toUpperCase() : null;

  return (
    <figure className={styles.codeBlock}>
      {languageLabel ? <div className={styles.codeBlockLabel}>{languageLabel}</div> : null}
      <pre className={styles.codeBlockPre}>
        <code>{code}</code>
      </pre>
      {caption ? <figcaption className={styles.figureCaption}>{caption}</figcaption> : null}
    </figure>
  );
}

CodeBlock.propTypes = {
  code: PropTypes.string.isRequired,
  language: PropTypes.string,
  caption: PropTypes.string,
};

CodeBlock.defaultProps = {
  language: null,
  caption: null,
};
