import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../auth/AuthContext";
import Header from "./Header";

const HeaderWrapper = () => {
	const { loggedIn } = useContext(AuthContext);
	const [authState, setAuthState] = useState(loggedIn);

	useEffect(() => {
		setAuthState(loggedIn);
	}, [loggedIn]);

	return <Header loggedIn={authState} />;
};

export default React.memo(HeaderWrapper);
