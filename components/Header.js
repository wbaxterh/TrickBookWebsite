import React, { useContext } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { AuthContext } from "../auth/AuthContext";
function Header() {
	const { loggedIn } = useContext(AuthContext);
	console.log("Is logged in:", loggedIn);

	return (
		<Navbar bg='light' className='navbar-fixed-top' expand='lg'>
			<Container>
				<Navbar.Brand href='/'>
					<Image
						className={styles.icon}
						src='/adaptive-icon.png' // Route of the image file
						style={{ margin: "0 auto", textAlign: "center" }}
						height={55} // Desired size with correct aspect ratio
						width={55} // Desired size with correct aspect ratio
						alt='Trick Book'
					/>
				</Navbar.Brand>
				<Navbar.Toggle aria-controls='basic-navbar-nav' />
				<Navbar.Collapse id='basic-navbar-nav'>
					<Nav className='me-auto'>
						<Nav.Link href='/'>Home</Nav.Link>
						<Nav.Link href='/blog'>Blog</Nav.Link>
						<Nav.Link href='/about'>About</Nav.Link>
						<Nav.Link href='/privacy-policy'>Privacy Policy</Nav.Link>
						<Nav.Link href='/questions-support'>Support</Nav.Link>
						{/* <NavDropdown title="Dropdown" id="basic-nav-dropdown">
                <NavDropdown.Item href="#action/3.1">Action</NavDropdown.Item>
                <NavDropdown.Item href="#action/3.2">
                  Another action
                </NavDropdown.Item>
                <NavDropdown.Item href="#action/3.3">Something</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item href="#action/3.4">
                  Separated link
                </NavDropdown.Item>
              </NavDropdown> */}
					</Nav>
					<Nav className={`ms-auto`}>
						<Nav.Link
							className={`mr-1 btn ${
								loggedIn ? "btn-secondary" : "btn-primary"
							} ${styles.login}`}
							href={loggedIn ? "/profile" : "/login"}
						>
							{loggedIn ? "Profile" : "Sign In"}
						</Nav.Link>
						<Nav.Link
							className={`ml-1 btn btn-secondary ${styles.login}`}
							href='/signup'
						>
							Create Account
						</Nav.Link>
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
}

export default Header;
