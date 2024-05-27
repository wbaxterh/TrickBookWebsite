// components/Layout.js
import React from "react";
import HeaderWrapper from "./HeaderWrapper";
import Footer from "./Footer";
import styles from "./layout.module.css";

export default function Layout({ children }) {
	return (
		<div className={styles.container}>
			<HeaderWrapper />
			<main>{children}</main>
			<Footer />
		</div>
	);
}
