import React, { useContext } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Image from "next/image";
import Link from "next/link"; // Import Link from next/link
import styles from "../styles/Home.module.css";
import { AuthContext } from "../auth/AuthContext";
import { Button, Skeleton } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import AddIcon from "@mui/icons-material/Add";

const Header = () => {
	const { email, loggedIn } = useContext(AuthContext);

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
						<NavDropdown title='Tools' id='tools-nav-dropdown'>
							<Link href='/trickipedia' passHref legacyBehavior>
								<NavDropdown.Item>Trickipedia</NavDropdown.Item>
							</Link>
							<Link href='/tricklist' passHref legacyBehavior>
								<NavDropdown.Item>TrickList</NavDropdown.Item>
							</Link>
						</NavDropdown>
						<Link href='/blog' passHref legacyBehavior>
							<Nav.Link>Blog</Nav.Link>
						</Link>
						<Link href='/about' passHref legacyBehavior>
							<Nav.Link>About</Nav.Link>
						</Link>
						{/* <Link href='/privacy-policy' passHref legacyBehavior>
							<Nav.Link>Privacy Policy</Nav.Link>
						</Link> */}
					</Nav>
					<Nav className={`ms-auto`}>
						{loggedIn === null ? (
							<Skeleton variant='rectangular' width={120} height={36} />
						) : !loggedIn ? (
							<>
								<Link href='/login' passHref legacyBehavior>
									{/* <Nav.Link
										className={`mx-2 btn ${styles.btnPrimary} ${styles.login}`}
									> */}
									<Button
										variant='contained'
										color='primary'
										className='custom-primary p-1 px-2'
										startIcon={<PersonIcon />}
										sx={{
											backgroundColor: "#fcf150",
											color: "#333",
										}} // Customize styles here
									>
										Login
									</Button>
									{/* </Nav.Link> */}
								</Link>
								<Link href='/signup' passHref legacyBehavior>
									<Button
										variant='outlined'
										color='secondary'
										className='p-1 px-2 ms-2'
										startIcon={<AddIcon />}
									>
										Create Account
									</Button>
								</Link>
							</>
						) : (
							<Link href='/profile' passHref legacyBehavior>
								<Button
									variant='contained'
									color='secondary'
									className='custom-primary p-1 px-2'
									startIcon={<PersonIcon />}
								>
									{email}
								</Button>
							</Link>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default Header;
