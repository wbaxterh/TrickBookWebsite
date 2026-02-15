import { Button, CircularProgress, Typography } from '@mui/material';
import axios from 'axios';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext'; // Adjust the path accordingly
import Header from '../../components/Header';
import styles from '../../styles/admin.module.css';

const UsersTable = ({ users }) => (
  <table className={styles.table}>
    <thead>
      <tr className={[styles.tableRow, 'p-1']}>
        <th>Name</th>
        <th>Email</th>
        <th>Password</th>
      </tr>
    </thead>
    <tbody>
      {users.map((user) => (
        <tr className={[styles.tableRow, 'p-1']} key={user._id}>
          <td>{user.name}</td>
          <td>{user.email}</td>
          <td>{user.password}</td>
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
        <th className={styles.tableCell}>User Name</th>
        <th className={styles.tableCell}>Tricks Count</th>
        <th className={styles.tableCell}>Tricks</th>
      </tr>
    </thead>
    <tbody>
      {tricklists.map((tricklist) => (
        <tr className={styles.tableRow} key={tricklist._id}>
          <td className={styles.tableCell}>{tricklist.name}</td>
          <td className={styles.tableCell}>{tricklist.user.name}</td>
          <td className={styles.tableCell}>{tricklist.tricks.length}</td>
          <td className={styles.tableCell}>
            <table className={styles.table}>
              <tbody>
                <tr className={styles.tableRow}>
                  {tricklist.tricks.map((trick) => (
                    <td className={styles.tableCell} key={trick._id}>
                      {trick.name}, <br />{' '}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

function admin({ isLoggedIn, users, tricklists }) {
  const { email, loggedIn, role } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true); // Add loading state

  useEffect(() => {
    if (loggedIn === null) {
      // Still checking login status
      return;
    }

    if (loggedIn && role === 'admin') {
      setLoading(false); // User is authenticated and has admin role
    } else {
      router.push('/login');
    }
  }, [loggedIn, role, router]);

  const [showTable, setShowTable] = useState(false);
  const [showTrickLists, setShowTrickLists] = useState(false);
  const _baseUrl = process.env.BASE_URL || 'http://localhost:9000'; // Default to localhost if BASE_URL is not set

  const toggleTable = () => {
    setShowTable((prevState) => !prevState);
  };
  const toggleTrickLists = () => {
    setShowTrickLists((prevState) => !prevState);
  };
  if (loading) {
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
      <Header />
      <div className="container-fluid m-2 mt-5">
        <Button variant="contained" color="primary" sx={{ mb: 2 }} href="/admin/categories">
          Manage Categories
        </Button>
        <h1 className="pt-3" style={{ textAlign: 'center' }}>
          Current Data {email}
        </h1>
        <button className="btn btn-light container-fluid my-1" onClick={toggleTable}>
          {' '}
          {!showTable ? (
            <i className="material-icons" style={{ fontSize: '12px' }}>
              add
            </i>
          ) : (
            <i className="material-icons" style={{ fontSize: '12px' }}>
              remove
            </i>
          )}{' '}
          Users
        </button>
        {showTable && <UsersTable users={users} />}
        <button className="btn btn-light container-fluid my-1" onClick={toggleTrickLists}>
          {!showTrickLists ? (
            <i className="material-icons" style={{ fontSize: '12px' }}>
              add
            </i>
          ) : (
            <i className="material-icons" style={{ fontSize: '12px' }}>
              remove
            </i>
          )}
          Trick Lists
        </button>
        {showTrickLists && <TrickListsTable tricklists={tricklists} />}
      </div>
    </>
  );
}

export async function getServerSideProps(_context) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9000'; // Default to localhost if BASE_URL is not set

  try {
    // Fetch all data using axios
    const [usersResponse, listingsResponse, allDataResponse] = await Promise.all([
      axios.get(`${baseUrl}/api/users/all`),
      axios.get(`${baseUrl}/api/listings/all`),
      axios.get(`${baseUrl}/api/listing/allData`),
    ]);

    const users = usersResponse.data;
    const tricklists = listingsResponse.data;
    const tricks = allDataResponse.data;

    // Join the tricklists and users data together
    for (const user of users) {
      for (const tricklist of tricklists) {
        if (tricklist.user.$id === user._id) {
          tricklist.user = user;
        }
        for (const trick of tricks) {
          for (let i = 0; i < tricklist.tricks.length; i++) {
            if (trick._id === tricklist.tricks[i]._id) {
              // console.log(trick.name);
              tricklist.tricks[i].name = trick.name;
            }
          }
        }
      }
    }

    // Check logged-in user
    // const { req } = context;
    // const token = req.cookies.token;

    // if (!token) {
    // 	return {
    // 		redirect: {
    // 			destination: "/login",
    // 			permanent: false,
    // 		},
    // 	};
    // }

    // try {
    // 	jwt.verify(token, "jwtPrivateKey"); // Replace with your actual secret key
    // } catch (e) {
    // 	console.log("Token verification failed:", e);
    // 	return {
    // 		redirect: {
    // 			destination: "/login",
    // 			permanent: false,
    // 		},
    // 	};
    // }

    return {
      props: {
        // isLoggedIn: "true",
        users,
        tricklists,
      },
    };
  } catch (_error) {
    // Handle error or redirect
    return {
      props: {
        error: 'Failed to load data.',
      },
    };
  }
}

export default admin;
