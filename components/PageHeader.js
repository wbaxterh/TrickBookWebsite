import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@mui/material";
import styles from "../styles/blog.module.css"; // Assuming the styles file is in the same location

const PageHeader = ({ title, className, sx, col, heroImage, author, date }) => {
	return (
		<div className={`row ${className}`}>
			<div className={`${col} p-0`}>
				{heroImage && (
					<div className={`position-relative ${styles.heroImageContainer}`}>
						<img
							src={heroImage}
							alt={`${title} Hero Image`}
							className={styles.heroImage}
						/>
						<div className={styles.overlay}>
							<Typography
								variant='h2'
								className={`header-text ${styles.headerText}`}
								sx={{ ...sx }}
							>
								{title}
							</Typography>
							{author && date && (
								<Typography variant='subtitle1' className={styles.authorDate}>
									By {author} on {new Date(date).toLocaleDateString()}
								</Typography>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

PageHeader.propTypes = {
	title: PropTypes.string.isRequired,
	className: PropTypes.string,
	sx: PropTypes.object,
	col: PropTypes.string,
	heroImage: PropTypes.string,
	author: PropTypes.string,
	date: PropTypes.string,
};

PageHeader.defaultProps = {
	className: "",
	sx: {},
	col: "col-sm",
	heroImage: null,
	author: null,
	date: null,
};

export default PageHeader;
