import React, { useContext, useEffect, useState, useRef } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { AuthContext } from "../auth/AuthContext";
import { Skeleton } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import { useTheme } from "next-themes";
import { Sun, Moon, MessageCircle, User, LogOut, ChevronDown } from "lucide-react";
import { getUnreadCount } from "../lib/apiMessages";
import { connectMessagesSocket } from "../lib/socket";

const Header = () => {
	const { email, loggedIn, token, logOut } = useContext(AuthContext);
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [unreadCount, setUnreadCount] = useState(0);
	const [expanded, setExpanded] = useState(false);
	const socketRef = useRef(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Fetch unread count and setup socket for real-time updates
	useEffect(() => {
		if (!loggedIn || !token) {
			setUnreadCount(0);
			return;
		}

		// Fetch initial unread count
		const fetchUnread = async () => {
			try {
				const data = await getUnreadCount(token);
				setUnreadCount(data.unreadCount || 0);
			} catch (error) {
				console.error("Error fetching unread count:", error);
			}
		};

		fetchUnread();

		// Setup socket for real-time updates
		const socket = connectMessagesSocket(token);
		socketRef.current = socket;

		// Listen for new messages to increment badge
		socket.on("message:new", ({ message }) => {
			// Only increment if not from current user
			setUnreadCount((prev) => prev + 1);
		});

		// Listen for read receipts to decrement badge
		socket.on("messages:read", () => {
			// Refetch to get accurate count
			fetchUnread();
		});

		return () => {
			socket.off("message:new");
			socket.off("messages:read");
		};
	}, [loggedIn, token]);

	const isDark = mounted && resolvedTheme === 'dark';

	return (
		<Navbar
			bg={isDark ? 'dark' : 'light'}
			variant={isDark ? 'dark' : 'light'}
			className={`navbar-fixed-top ${styles.navWrapper}`}
			expand="lg"
			expanded={expanded}
			onToggle={(value) => setExpanded(value)}
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
				<Navbar.Collapse id='basic-navbar-nav' style={{ backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }}>
					<Nav className='me-auto mobile-nav-section'>
						<Link href='/trickbook' passHref legacyBehavior>
							<Nav.Link className='mobile-nav-link' style={{ color: isDark ? '#f0f0f0' : '#1a1a1a' }} onClick={() => setExpanded(false)}>
								<span role='img' aria-label='book'>
									📖
								</span>{" "}
								TrickBook
							</Nav.Link>
						</Link>
						<Link href='/spots' passHref legacyBehavior>
							<Nav.Link className='mobile-nav-link' style={{ color: isDark ? '#f0f0f0' : '#1a1a1a' }} onClick={() => setExpanded(false)}>
								<span role='img' aria-label='pin'>
									📍
								</span>{" "}
								Spots
							</Nav.Link>
						</Link>
						<Link href='/homies' passHref legacyBehavior>
							<Nav.Link className='mobile-nav-link' style={{ color: isDark ? '#f0f0f0' : '#1a1a1a' }} onClick={() => setExpanded(false)}>
								<span role='img' aria-label='homies'>
									🤝
								</span>{" "}
								Homies
							</Nav.Link>
						</Link>
						<Link href='/media' passHref legacyBehavior>
							<Nav.Link className='mobile-nav-link' style={{ color: isDark ? '#f0f0f0' : '#1a1a1a' }} onClick={() => setExpanded(false)}>
								<span role='img' aria-label='media'>
									🎬
								</span>{" "}
								Media
							</Nav.Link>
						</Link>
					</Nav>

					{/* Mobile divider */}
					<hr className='mobile-nav-divider d-lg-none' />

					<Nav className={`ms-auto align-items-lg-center mobile-utility-section`}>
						{/* Theme Toggle */}
						{mounted && (
							<button
								onClick={() => setTheme(isDark ? 'light' : 'dark')}
								className='theme-toggle-btn'
								aria-label='Toggle theme'
							>
								{isDark ? <Sun size={18} /> : <Moon size={18} />}
								<span className='theme-toggle-label'>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
							</button>
						)}

						{/* Mobile divider before account section */}
						<hr className='mobile-nav-divider d-lg-none' />

						{loggedIn === null ? (
							<Skeleton variant='rectangular' width={120} height={36} />
						) : !loggedIn ? (
							<Link href='/login' passHref legacyBehavior>
								<a className='login-btn'>
									<PersonIcon style={{ fontSize: 18 }} />
									<span>Login / Register</span>
								</a>
							</Link>
						) : (
							<NavDropdown
								align="end"
								title={
									<span style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: 6,
										position: 'relative',
										color: isDark ? '#1a1a1a' : '#f0f0f0'
									}}>
										<PersonIcon style={{ fontSize: 20 }} />
										<span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
											{email}
										</span>
										{unreadCount > 0 && (
											<span
												style={{
													position: 'absolute',
													top: -8,
													right: -8,
													backgroundColor: '#fcf150',
													color: '#000',
													borderRadius: '50%',
													minWidth: 18,
													height: 18,
													fontSize: 11,
													fontWeight: 'bold',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													padding: '0 4px',
												}}
											>
												{unreadCount > 99 ? '99+' : unreadCount}
											</span>
										)}
									</span>
								}
								id="profile-dropdown"
								className="profile-dropdown"
								style={{
									backgroundColor: isDark ? "#333" : "#e0e0e0",
									borderRadius: 4,
								}}
							>
								<Link href='/profile' passHref legacyBehavior>
									<NavDropdown.Item style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
										<User size={18} />
										My Profile
									</NavDropdown.Item>
								</Link>
								<Link href='/messages' passHref legacyBehavior>
									<NavDropdown.Item style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
										<MessageCircle size={18} />
										Messages
										{unreadCount > 0 && (
											<span
												style={{
													marginLeft: 'auto',
													backgroundColor: '#fcf150',
													color: '#000',
													borderRadius: '50%',
													minWidth: 20,
													height: 20,
													fontSize: 12,
													fontWeight: 'bold',
													display: 'flex',
													alignItems: 'center',
													justifyContent: 'center',
													padding: '0 6px',
												}}
											>
												{unreadCount > 99 ? '99+' : unreadCount}
											</span>
										)}
									</NavDropdown.Item>
								</Link>
								<NavDropdown.Divider />
								<NavDropdown.Item
									onClick={logOut}
									style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#dc3545', cursor: 'pointer' }}
								>
									<LogOut size={18} />
									Logout
								</NavDropdown.Item>
							</NavDropdown>
						)}
					</Nav>
				</Navbar.Collapse>
			</Container>
		</Navbar>
	);
};

export default Header;
