import React, {useState} from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import Head from 'next/head';
import Layout from '../components/layout';
import Image from 'next/image';
import Header from '../components/Header';
import fetch from "isomorphic-unfetch";


const UsersTable = ({ users }) => (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Password</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => (
          <tr key={user._id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.password}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
  const TrickListsTable = ({ tricklists }) => (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>User ID</th>
          <th>Tricks Count</th>
          <th>Tricks</th>
        </tr>
      </thead>
      <tbody>
      {tricklists.map((tricklist) => (
        <tr key={tricklist._id}>
            <td>{tricklist.name}</td>
            <td>{tricklist.user.$id}</td>
            <td>{tricklist.tricks.length}</td>
            <td>
            <table>
                <tbody>
                <tr>
                    {tricklist.tricks.map((trick) => (
                    <td key={trick._id}>{trick._id}, </td>
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
  
function admin({users, tricklists}) {
    const [showTable, setShowTable] = useState(false);
    const [showTrickLists, setShowTrickLists] = useState(false);

const toggleTable = () => {
  setShowTable((prevState) => !prevState);
};
const toggleTrickLists = () =>{
    setShowTrickLists((prevState) => !prevState);
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
        <meta name="keywords" content="Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App" />
      </Head>
      <Header />
      <Layout>
      
  <h1 className="pt-3" style={{textAlign:'center'}}>Admin</h1>
  <button className="btn btn-primary" onClick={toggleTable}>Users</button>
  { showTable && (
  <UsersTable users={users} />
  )
}
<button className="btn btn-primary" onClick={toggleTrickLists}>Trick Lists</button>
  { showTrickLists && (
  <TrickListsTable tricklists={tricklists} />
  )
}
    {/* <h2>
        <Link href="/"> <span class="material-icons">arrow_back</span> Back to home</Link>
        </h2> */}
    </Layout>
    </>
    );
}

export async function getServerSideProps() {
    // Fetch all users from the API
    const res = await fetch("http://localhost:9000/api/users/all");
    const res2 = await fetch("http://localhost:9000/api/listings/all");
    const users = await res.json();
    const tricklists = await res2.json();
  
    return {
      props: {
        users,
        tricklists
      },
    };
  }

export default admin;