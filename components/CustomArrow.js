import React from "react";
import { IconButton } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";
import styles from "../styles/Home.module.css";

export function NextArrow(props) {
	const { className, style, onClick } = props;
	return (
		<IconButton
			className={`${className} ${styles.arrow} ${styles.nextArrow}`}
			style={{ ...style, display: "block" }}
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
			className={`${className} ${styles.arrow} ${styles.prevArrow}`}
			style={{ ...style, display: "block" }}
			onClick={onClick}
		>
			{/* <ArrowBack style={{ color: "#1E1E1E" }} /> */}
		</IconButton>
	);
}
