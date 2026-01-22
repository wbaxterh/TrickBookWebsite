import React, { useContext, useEffect, useState, useRef } from "react";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import NavDropdown from "react-bootstrap/NavDropdown";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { AuthContext } from "../auth/AuthContext";
import { Button, Skeleton } from "@mui/material";
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
						<Link href='/trickbook' passHref legacyBehavior>
							<Nav.Link>
								<span role='img' aria-label='book'>
									📖
								</span>{" "}
								TrickBook
							</Nav.Link>
						</Link>
						<Link href='/spots' passHref legacyBehavior>
							<Nav.Link>
								<span role='img' aria-label='pin'>
									📍
								</span>{" "}
								Spots
							</Nav.Link>
						</Link>
						<Link href='/homies' passHref legacyBehavior>
							<Nav.Link>
								<span role='img' aria-label='homies'>
									🤝
								</span>{" "}
								Homies
							</Nav.Link>
						</Link>
						<Link href='/media' passHref legacyBehavior>
							<Nav.Link>
								<span role='img' aria-label='media'>
									🎬
								</span>{" "}
								Media
							</Nav.Link>
						</Link>
					</Nav>
					<Nav className={`ms-auto align-items-center`}>
						{/* Theme Toggle */}
						{mounted && (
							<button
								onClick={() => setTheme(isDark ? 'light' : 'dark')}
								className='btn btn-link p-2 me-2'
								style={{
									color: isDark ? '#ffd700' : '#333',
									border: 'none',
									background: 'transparent'
								}}
								aria-label='Toggle theme'
							>
								{isDark ? <Sun size={20} /> : <Moon size={20} />}
							</button>
						)}
						{loggedIn === null ? (
							<Skeleton variant='rectangular' width={120} height={36} />
						) : !loggedIn ? (
							<Link href='/login' passHref legacyBehavior>
								<Button
									variant='contained'
									color='primary'
									className='custom-primary p-1 px-2'
									startIcon={<PersonIcon />}
									sx={{
										backgroundColor: "#fcf150",
										color: "#333",
									}}
								>
									Login / Register
								</Button>
							</Link>
						) : (
							<NavDropdown
								align="end"
								title={
									<span style={{
										display: 'inline-flex',
										alignItems: 'center',
										gap: 6,
										position: 'relative'
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
									backgroundColor: isDark ? "#e0e0e0" : "#1f1f1f",
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
