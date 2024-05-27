import React, { useContext } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import Image from "next/image";
import Link from "next/link"; // Import Link from next/link
import styles from "../styles/Home.module.css";
import { AuthContext } from "../auth/AuthContext";

const Header = () => {
	const { loggedIn } = useContext(AuthContext);
	// console.log("Is logged in:", loggedIn);

	// Render nothing until the loggedIn state is determined
	if (loggedIn === null) {
		return null;
	}

	return (
		<Navbar
			bg='light'
			className={`navbar-fixed-top ${styles.navWrapper}`}
			expand='lg'
		>
			<Container>
				<Link href='/' legacyBehavior>
					<Navbar.Brand>
						<a>
							<Image
								className={styles.icon}
								src='/adaptive-icon.png'
								style={{ margin: "0 auto", textAlign: "center" }}
								height={55}
								width={55}
								alt='Trick Book'
							/>
						</a>
					</Navbar.Brand>
				</Link>
				<Navbar.Toggle aria-controls='basic-navbar-nav' />
				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className='me-auto'>
						<Link href='/' passHref legacyBehavior>
							<Nav.Link>Home</Nav.Link>
						</Link>
						<Link href='/blog' passHref legacyBehavior>
							<Nav.Link>Blog</Nav.Link>
						</Link>
						<Link href='/about' passHref legacyBehavior>
							<Nav.Link>About</Nav.Link>
						</Link>
						<Link href='/privacy-policy' passHref legacyBehavior>
							<Nav.Link>Privacy Policy</Nav.Link>
						</Link>
						<Link href='/questions-support' passHref legacyBehavior>
							<Nav.Link>Support</Nav.Link>
						</Link>
					</Nav>
					<Nav className={`ms-auto`}>
						{!loggedIn ? (
							<>
								<Link href='/login' passHref legacyBehavior>
									<Nav.Link
										className={`mx-2 btn ${styles.btnPrimary} ${styles.login}`}
									>
										Sign In
									</Nav.Link>
								</Link>
								<Link href='/signup' passHref legacyBehavior>
									<Nav.Link
										className={`ml-1 btn btn-secondary ${styles.login}`}
									>
										Create Account
									</Nav.Link>
								</Link>
							</>
						) : (
							<Link href='/profile' passHref legacyBehavior>
								<Nav.Link
									className={`mx-2 btn btn-primary ${styles.btnPrimary} ${styles.login}`}
								>
									Profile
								</Nav.Link>
							</Link>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default Header;
