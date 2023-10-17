import React, { useState } from "react";
import Link from "next/link";
import styles from "../../styles/admin.module.css";
import Head from "next/head";
import Layout from "../../components/layout";
import Image from "next/image";
import Header from "../../components/Header";
import fetch from "isomorphic-unfetch";
import { useContext } from "react";
import { AuthContext } from "../../auth/AuthContext"; // Adjust the path accordingly
import jwt from "jsonwebtoken";

const UsersTable = ({ users }) => (
	<table className={styles.table}>
		<thead>
			<tr className={[styles.tableRow, "p-1"]}>
				<th>Name</th>
				<th>Email</th>
				<th>Password</th>
			</tr>
		</thead>
		<tbody>
			{users.map((user) => (
				<tr className={[styles.tableRow, "p-1"]} key={user._id}>
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
											{trick.name}, <br />{" "}
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
	const { email } = useContext(AuthContext);

	const [showTable, setShowTable] = useState(false);
	const [showTrickLists, setShowTrickLists] = useState(false);

	const toggleTable = () => {
		setShowTable((prevState) => !prevState);
	};
	const toggleTrickLists = () => {
		setShowTrickLists((prevState) => !prevState);
	};
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
			<Layout>
				<h1 className="pt-3" style={{ textAlign: "center" }}>
					Current Data {email}
				</h1>
				<button
					className="btn btn-light container-fluid my-1"
					onClick={toggleTable}
				>
					{" "}
					{!showTable ? (
						<i className="material-icons" style={{ fontSize: "12px" }}>
							add
						</i>
					) : (
						<i className="material-icons" style={{ fontSize: "12px" }}>
							remove
						</i>
					)}{" "}
					Users
				</button>
				{showTable && <UsersTable users={users} />}
				<button
					className="btn btn-light container-fluid my-1"
					onClick={toggleTrickLists}
				>
					{!showTrickLists ? (
						<i className="material-icons" style={{ fontSize: "12px" }}>
							add
						</i>
					) : (
						<i className="material-icons" style={{ fontSize: "12px" }}>
							remove
						</i>
					)}
					Trick Lists
				</button>
				{showTrickLists && <TrickListsTable tricklists={tricklists} />}
				{/* <h2>
              <Link href="/"> <span class="material-icons">arrow_back</span> Back to home</Link>
              </h2> */}
			</Layout>
		</>
	);
}

export async function getServerSideProps(context) {
	// Fetch all users from the API
	const res = await fetch("http://localhost:9000/api/users/all");
	const res2 = await fetch("http://localhost:9000/api/listings/all");
	const res3 = await fetch(`http://localhost:9000/api/listing/allData`);
	const tricks = await res3.json();
	const users = await res.json();
	const tricklists = await res2.json();

	// Join the tricklists and users data together
	for (const user of users) {
		for (const tricklist of tricklists) {
			if (tricklist.user.$id === user._id) {
				tricklist.user = user;
			}
			for (const trick of tricks) {
				for (var i = 0; i < tricklist.tricks.length; i++) {
					if (trick._id == tricklist.tricks[i]._id) {
						// console.log(trick.name);
						tricklist.tricks[i].name = trick.name;
					}
				}
			}
		}
	}

	//check logged in user
	const { req } = context;
	const token = req.cookies.token;

	if (!token) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

	try {
		const decoded = jwt.verify(token, "jwtPrivateKey"); // Replace with your actual secret key
		console.log("Decoded Token: ", decoded);
		if (decoded.email !== "wesleybaxterhuber@gmail.com") {
			return {
				redirect: {
					destination: "/login",
					permanent: false,
				},
			};
		}
	} catch (e) {
		console.log("Token verification failed:", e);
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			},
		};
	}

	return {
		props: {
			isLoggedIn: "true",
			users,
			tricklists,
		},
	};
}

export default admin;
