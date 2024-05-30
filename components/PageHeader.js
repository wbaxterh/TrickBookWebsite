import React from "react";
import PropTypes from "prop-types";
import { Typography } from "@mui/material";

const PageHeader = ({ title, className, sx, col }) => {
	return (
		<div className={`row header-bg ${className}`}>
			<div className={col}>
				<Typography
					variant='h2'
					className='p-3 m-3 header-text'
					sx={{ textAlign: "center", fontWeight: 400, width: "auto", ...sx }}
				>
					{title}
				</Typography>
			</div>
		</div>
	);
};

PageHeader.propTypes = {
	title: PropTypes.string.isRequired,
	className: PropTypes.string,
	sx: PropTypes.object,
};

PageHeader.defaultProps = {
	className: "",
	sx: {},
};

export default PageHeader;
