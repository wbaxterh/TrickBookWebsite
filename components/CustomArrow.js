import { IconButton } from '@mui/material';
import styles from '../styles/Home.module.css';

export function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <IconButton
      className={`${className} ${styles.arrow} ${styles.nextArrow} bg-dark mx-2`}
      style={{ ...style, display: 'block', color: '#1E1E1E' }}
      onClick={onClick}
    >
      {/* <ArrowForward style={{ color: "#1E1E1E" }} /> */}
    </IconButton>
  );
}

export function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <IconButton
      className={`${className} ${styles.arrow} ${styles.prevArrow} bg-dark mx-2`}
      style={{ ...style, display: 'block' }}
      onClick={onClick}
    >
      {/* <ArrowBack style={{ color: "#1E1E1E" }} /> */}
    </IconButton>
  );
}
