import { Box, Button, Chip, CircularProgress, Pagination, Typography } from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getToken } from 'next-auth/jwt';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import AdminNav from '../../components/AdminNav';
import styles from '../../styles/admin.module.css';

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://api.thetrickbook.com';
const PAGE_LIMIT = 25;

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString();
}

const UsersTable = ({ users }) => (
  <table className={styles.table}>
    <thead>
      <tr className={styles.tableRow}>
        <th className={styles.tableCell}>Name</th>
        <th className={styles.tableCell}>Email</th>
        <th className={styles.tableCell}>Role</th>
        <th className={styles.tableCell}>Created</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => (
        <tr className={styles.tableRow} key={user._id}>
          <td className={styles.tableCell}>{user.name || '—'}</td>
          <td className={styles.tableCell}>{user.email || '—'}</td>
          <td className={styles.tableCell}>{user.role || 'user'}</td>
          <td className={styles.tableCell}>{formatDate(user.createdAt)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const TrickListsTable = ({ tricklists }) => (
  <table className={styles.table}>
    <thead>
      <tr className={styles.tableRow}>
        <th className={styles.tableCell}>Name</th>
        <th className={styles.tableCell}>Tricks</th>
        <th className={styles.tableCell}>Visibility</th>
      </tr>
    </thead>
    <tbody>
      {tricklists.map((tricklist) => (
        <tr className={styles.tableRow} key={tricklist._id}>
          <td className={styles.tableCell}>{tricklist.name || '—'}</td>
          <td className={styles.tableCell}>{tricklist.tricksCount ?? 0}</td>
          <td className={styles.tableCell}>
            <Chip
              label={tricklist.isPublic ? 'Public' : 'Private'}
              size="small"
              sx={
                tricklist.isPublic
                  ? { backgroundColor: '#fff000', color: '#1f1f1f', fontWeight: 600 }
                  : { backgroundColor: '#232a36', color: '#a7b1c2', border: '1px solid #2a2f3a' }
              }
            />
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

const PAGINATION_SX = {
  '& .MuiPaginationItem-root': { color: '#edf2f7' },
  '& .Mui-selected': { backgroundColor: '#fff000 !important', color: '#1f1f1f' },
};

// Encapsulates the loading / error+retry / empty / data+pagination states for a
// single paginated admin section (mirrors the state handling in spots.js).
const PagedSection = ({
  title,
  loading,
  error,
  onRetry,
  isEmpty,
  page,
  totalPages,
  onPageChange,
  emptyLabel,
  children,
}) => {
  let body;
  if (loading) {
    body = (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  } else if (error) {
    body = (
      <Box py={2}>
        <Typography variant="body1" color="error" gutterBottom>
          {error}
        </Typography>
        <Button variant="outlined" onClick={onRetry}>
          Retry
        </Button>
      </Box>
    );
  } else if (isEmpty) {
    body = (
      <Typography variant="h6" sx={{ color: '#a7b1c2' }}>
        {emptyLabel}
      </Typography>
    );
  } else {
    body = (
      <>
        {children}
        {totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={3}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={onPageChange}
              color="primary"
              sx={PAGINATION_SX}
            />
          </Box>
        )}
      </>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom sx={{ mt: 4 }}>
        {title}
      </Typography>
      {body}
    </>
  );
};

function Admin() {
  const { email, loggedIn, role, token } = useContext(AuthContext);
  const router = useRouter();

  const [users, setUsers] = useState([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);
  const [usersLoaded, setUsersLoaded] = useState(false);
  const [usersError, setUsersError] = useState('');

  const [tricklists, setTricklists] = useState([]);
  const [tricklistsTotal, setTricklistsTotal] = useState(0);
  const [tricklistsPage, setTricklistsPage] = useState(1);
  const [tricklistsTotalPages, setTricklistsTotalPages] = useState(0);
  const [tricklistsLoading, setTricklistsLoading] = useState(true);
  const [tricklistsLoaded, setTricklistsLoaded] = useState(false);
  const [tricklistsError, setTricklistsError] = useState('');

  // Auth guard
  useEffect(() => {
    if (loggedIn === null) return;
    if (!loggedIn || role !== 'admin') {
      router.push('/login');
    }
  }, [loggedIn, role, router]);

  const handleAuthError = useCallback(
    (error) => {
      const status = error?.response?.status;
      if (status === 401 || status === 403) {
        router.push('/login');
        return true;
      }
      return false;
    },
    [router],
  );

  const fetchUsers = useCallback(
    async (page) => {
      if (!token) return;
      setUsersLoading(true);
      setUsersError('');
      try {
        const response = await axios.get(`${API_BASE}/api/users/all`, {
          headers: { 'x-auth-token': token },
          params: { page, limit: PAGE_LIMIT },
        });
        const data = response.data || {};
        setUsers(data.items || []);
        setUsersTotal(data.total || 0);
        setUsersTotalPages(data.totalPages || 0);
        setUsersLoaded(true);
      } catch (error) {
        if (!handleAuthError(error)) {
          setUsersError('Failed to load users.');
        }
      } finally {
        setUsersLoading(false);
      }
    },
    [token, handleAuthError],
  );

  const fetchTricklists = useCallback(
    async (page) => {
      if (!token) return;
      setTricklistsLoading(true);
      setTricklistsError('');
      try {
        const response = await axios.get(`${API_BASE}/api/listings/all`, {
          headers: { 'x-auth-token': token },
          params: { page, limit: PAGE_LIMIT },
        });
        const data = response.data || {};
        setTricklists(data.items || []);
        setTricklistsTotal(data.total || 0);
        setTricklistsTotalPages(data.totalPages || 0);
        setTricklistsLoaded(true);
      } catch (error) {
        if (!handleAuthError(error)) {
          setTricklistsError('Failed to load trick lists.');
        }
      } finally {
        setTricklistsLoading(false);
      }
    },
    [token, handleAuthError],
  );

  useEffect(() => {
    if (!loggedIn || role !== 'admin' || !token) return;
    fetchUsers(usersPage);
  }, [loggedIn, role, token, usersPage, fetchUsers]);

  useEffect(() => {
    if (!loggedIn || role !== 'admin' || !token) return;
    fetchTricklists(tricklistsPage);
  }, [loggedIn, role, token, tricklistsPage, fetchTricklists]);

  // Still checking auth or not authorized
  if (loggedIn === null || !loggedIn || role !== 'admin') {
    return (
      <div className="loading">
        <CircularProgress />
        <Typography variant="h5">Loading...</Typography>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>The Trick Book - Admin</title>
        <link rel="icon" href="/favicon.png" />
        <meta name="description" content="The Trick Book - Admin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://thetrickbook.com/" />
        <meta name="author" content="Wes Huber" />
        <meta
          name="keywords"
          content="Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App"
        />
      </Head>
      <div className={`container ${styles.container}`}>
        <div className="container m-4 mt-5 pt-3" style={{ color: '#edf2f7' }}>
          <AdminNav />

          <Button variant="contained" color="primary" sx={{ mb: 2 }} href="/admin/categories">
            Manage Categories
          </Button>

          <Typography variant="h2" gutterBottom>
            Admin Dashboard
          </Typography>
          {email && (
            <Typography variant="body2" gutterBottom sx={{ color: '#a7b1c2' }}>
              Signed in as {email}
            </Typography>
          )}

          {/* Stats / overview header */}
          <Box display="flex" gap={2} flexWrap="wrap" my={3}>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{usersLoaded ? usersTotal : '—'}</div>
              <div className={styles.statLabel}>Total Users</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statNumber}>{tricklistsLoaded ? tricklistsTotal : '—'}</div>
              <div className={styles.statLabel}>Total Trick Lists</div>
            </div>
          </Box>

          {/* Users */}
          <PagedSection
            title="Users"
            loading={usersLoading}
            error={usersError}
            onRetry={() => fetchUsers(usersPage)}
            isEmpty={usersLoaded && users.length === 0}
            page={usersPage}
            totalPages={usersTotalPages}
            onPageChange={(_event, value) => setUsersPage(value)}
            emptyLabel="No users found."
          >
            <UsersTable users={users} />
          </PagedSection>

          {/* Trick Lists */}
          <PagedSection
            title="Trick Lists"
            loading={tricklistsLoading}
            error={tricklistsError}
            onRetry={() => fetchTricklists(tricklistsPage)}
            isEmpty={tricklistsLoaded && tricklists.length === 0}
            page={tricklistsPage}
            totalPages={tricklistsTotalPages}
            onPageChange={(_event, value) => setTricklistsPage(value)}
            emptyLabel="No trick lists found."
          >
            <TrickListsTable tricklists={tricklists} />
          </PagedSection>
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  // Cheap auth check only — no data fetching here (data is loaded client-side).
  const sessionToken = await getToken({ req: context.req, secret: process.env.NEXTAUTH_SECRET });
  const backendToken = sessionToken?.jwtToken?.token;

  if (!backendToken) {
    return { redirect: { destination: '/login', permanent: false } };
  }

  return { props: {} };
}

export default Admin;
