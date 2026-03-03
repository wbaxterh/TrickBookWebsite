import Footer from './Footer';
import HeaderWrapper from './HeaderWrapper';
import styles from './layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.container}>
      <HeaderWrapper />
      <main className={styles.mainContent}>{children}</main>
      <Footer />
    </div>
  );
}
