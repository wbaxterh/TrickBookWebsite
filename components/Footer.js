import React from "react";
import Link from "next/link";
import styles from "./layout.module.css";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import YouTubeIcon from "@mui/icons-material/YouTube";

function Footer() {
	return (
		<footer className={styles.footer}>
			<div className={styles.footerContent}>
				<div className={styles.subnavLeft}>
					<Link href='https://instagram.com' passHref>
						<span className={styles.icon} role='img' aria-label='Instagram'>
							<InstagramIcon />
						</span>
					</Link>
					<Link href='https://twitter.com' passHref>
						<span className={styles.icon} role='img' aria-label='Twitter'>
							<XIcon />
						</span>
					</Link>
					<Link href='https://youtube.com' passHref>
						<span className={styles.icon} role='img' aria-label='YouTube'>
							<YouTubeIcon />
						</span>
					</Link>
				</div>
				<div className={styles.subnavCenter}>
					<p>© 2024 The Trick Book</p>
				</div>
				<div className={styles.subnavRight}>
					<Link href='/questions-support' passHref>
						<span>Questions & Support</span>
					</Link>
					<Link href='/privacy-policy' passHref>
						<span>Privacy Policy</span>
					</Link>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
