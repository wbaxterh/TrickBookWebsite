import React, { Component } from "react";
import styles from "./layout.module.css";

function Footer() {
	return (
		<footer className={styles.footer}>
			<a href="https://weshuber.com" className={styles.linkTheme}>
				Made with love ♥
			</a>
			{/* <img src="/vercel.svg" alt="Vercel" className={styles.logo} /> */}
		</footer>
	);
}
export default Footer;
