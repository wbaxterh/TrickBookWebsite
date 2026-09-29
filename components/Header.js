import PersonIcon from '@mui/icons-material/Person';
import { Skeleton } from '@mui/material';
import {
  BookOpen,
  CalendarDays,
  Clapperboard,
  LogOut,
  MapPin,
  Menu,
  MessageCircle,
  Moon,
  Store,
  Sun,
  User,
  Users,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { useTheme } from 'next-themes';
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { getUnreadCount } from '../lib/apiMessages';
import { connectMessagesSocket } from '../lib/socket';
import { cn } from '../lib/utils';
import styles from '../styles/Home.module.css';
import LanguageSelector from './LanguageSelector';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const unreadBadgeStyle = {
  backgroundColor: '#fcf150',
  color: '#000',
  borderRadius: '50%',
  fontWeight: 'bold',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const menuItemStyle = { display: 'flex', alignItems: 'center', gap: 10 };

const Header = () => {
  const { t } = useTranslation('common');
  const { email, loggedIn, token, logOut } = useContext(AuthContext);
  const { setTheme, resolvedTheme } = useTheme();
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
      } catch (_error) {}
    };

    fetchUnread();

    // Setup socket for real-time updates
    const socket = connectMessagesSocket(token);
    socketRef.current = socket;

    // Listen for new messages to increment badge
    socket.on('message:new', () => {
      // Only increment if not from current user
      setUnreadCount((prev) => prev + 1);
    });

    // Listen for read receipts to decrement badge
    socket.on('messages:read', () => {
      // Refetch to get accurate count
      fetchUnread();
    });

    return () => {
      socket.off('message:new');
      socket.off('messages:read');
    };
  }, [loggedIn, token]);

  const isDark = mounted && resolvedTheme === 'dark';
  const closeMenu = () => setExpanded(false);
  const linkColor = isDark ? '#f0f0f0' : '#1a1a1a';

  const navItems = [
    { href: '/trickbook', label: t('nav.trickbook', 'TrickBook'), Icon: BookOpen },
    { href: '/media', label: t('nav.media', 'Media'), Icon: Clapperboard },
    { href: '/spots', label: t('nav.spots', 'Spots'), Icon: MapPin },
    { href: '/events', label: t('nav.events', 'Events'), Icon: CalendarDays },
    { href: '/shops', label: t('nav.shops', 'Shops'), Icon: Store },
    { href: '/riders', label: t('nav.riders', 'Riders'), Icon: Users },
  ];

  return (
    <header className={`site-header ${styles.navWrapper}`}>
      <div className="container site-header-inner">
        <Link href="/" className="site-brand">
          <Image
            className={styles.icon}
            src="/adaptive-icon.png"
            style={{ margin: '0 auto', textAlign: 'center' }}
            height={55}
            width={55}
            alt={t('brand.logoAlt', 'Trick Book')}
          />
        </Link>
        <button
          type="button"
          className="nav-toggle lg:hidden"
          data-testid="nav-toggle"
          aria-controls="site-nav"
          aria-expanded={expanded}
          aria-label={t('nav.toggleMenu', 'Toggle navigation')}
          onClick={() => setExpanded((value) => !value)}
        >
          <Menu style={{ width: '1.5em', height: '1.5em' }} aria-hidden="true" />
        </button>
        <div
          id="site-nav"
          className={cn('site-nav-collapse', expanded ? 'block' : 'hidden', 'lg:flex')}
        >
          <nav
            className="site-nav site-nav-primary mobile-nav-section"
            aria-label={t('nav.primary', 'Primary')}
          >
            {navItems.map(({ href, label, Icon }) => (
              <Link
                key={href}
                href={href}
                className="site-nav-link mobile-nav-link"
                style={{ color: linkColor }}
                onClick={closeMenu}
              >
                <Icon size={17} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          {/* Mobile divider */}
          <hr className="mobile-nav-divider lg:hidden" />

          <div className="site-nav site-nav-utility mobile-utility-section">
            {/* Language Selector */}
            <LanguageSelector onSelect={closeMenu} />

            {/* Theme Toggle */}
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="theme-toggle-btn"
                aria-label={t('theme.toggle', 'Toggle theme')}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                <span className="theme-toggle-label">
                  {isDark ? t('theme.light', 'Light Mode') : t('theme.dark', 'Dark Mode')}
                </span>
              </button>
            )}

            {/* Mobile divider before account section */}
            <hr className="mobile-nav-divider lg:hidden" />

            {loggedIn === null ? (
              <Skeleton variant="rectangular" width={120} height={36} />
            ) : !loggedIn ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14 }}>
                <Link
                  href="/login"
                  style={{
                    color: linkColor,
                    fontWeight: 500,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t('nav.login', 'Log in')}
                </Link>
                <Link href="/signup" className="login-btn">
                  <PersonIcon style={{ fontSize: 18 }} />
                  <span>{t('nav.signupFree', 'Sign up free')}</span>
                </Link>
              </div>
            ) : (
              <DropdownMenu modal={false}>
                <div
                  className="profile-dropdown"
                  style={{
                    backgroundColor: isDark ? '#333' : '#e0e0e0',
                    borderRadius: 4,
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      id="profile-dropdown"
                      className="profile-dropdown-toggle tb-caret"
                      data-testid="profile-toggle"
                    >
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          position: 'relative',
                          color: isDark ? '#1a1a1a' : '#f0f0f0',
                        }}
                      >
                        <PersonIcon style={{ fontSize: 20 }} />
                        <span
                          style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}
                        >
                          {email}
                        </span>
                        {unreadCount > 0 && (
                          <span
                            style={{
                              ...unreadBadgeStyle,
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              minWidth: 18,
                              height: 18,
                              fontSize: 11,
                              padding: '0 4px',
                            }}
                          >
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                </div>
                <DropdownMenuContent
                  align="end"
                  sideOffset={2}
                  className="tb-dropdown-menu profile-dropdown-menu"
                >
                  <DropdownMenuItem asChild className="tb-dropdown-item profile-dropdown-item">
                    <Link href="/profile" style={menuItemStyle}>
                      <User size={18} />
                      {t('nav.myProfile', 'My Profile')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="tb-dropdown-item profile-dropdown-item">
                    <Link href="/messages" style={menuItemStyle}>
                      <MessageCircle size={18} />
                      {t('nav.messages', 'Messages')}
                      {unreadCount > 0 && (
                        <span
                          style={{
                            ...unreadBadgeStyle,
                            marginLeft: 'auto',
                            minWidth: 20,
                            height: 20,
                            fontSize: 12,
                            padding: '0 6px',
                          }}
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="tb-dropdown-item profile-dropdown-item">
                    <Link href="/homies" style={menuItemStyle}>
                      <Users size={18} />
                      {t('nav.homies', 'Homies')}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="tb-dropdown-divider" />
                  <DropdownMenuItem
                    className="tb-dropdown-item profile-dropdown-item"
                    onSelect={logOut}
                    style={{ ...menuItemStyle, color: '#dc3545', cursor: 'pointer' }}
                  >
                    <LogOut size={18} />
                    {t('nav.logout', 'Logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
