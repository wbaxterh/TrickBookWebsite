import Link from "next/link";
import styles from "../styles/privacy.module.css";
import Head from "next/head";
import PageHeader from "../components/PageHeader";
import { Typography, Button } from "@mui/material";

export default function TermsConditions() {
	return (
		<>
			<Head>
				<title>The Trick Book - Terms and Conditions</title>
				<link rel='icon' href='/favicon.png' />
				<meta
					name='description'
					content='The Trick Book - Terms and Conditions'
				/>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<meta name='robots' content='index, follow' />
				<link rel='canonical' href='https://thetrickbook.com/' />
				<meta name='author' content='Wes Huber' />
				<meta
					name='keywords'
					content='Trick, Book, Skateboarding, Snowboarding, Trickbook, TheTrickBook, App'
				/>
			</Head>
			<div className={`container-fluid ${styles.privacyContainer}`}>
				<PageHeader title='Terms and Conditions' col='col-sm-5' />
				<div className='container'>
					<Typography variant='body1' className='my-5'>
						<p>
							<i>Effective date: 03.03.2023</i>
						</p>

						<p>
							Welcome to The Trick Book! These terms and conditions outline the
							rules and regulations for the use of The Trick Book's App.
						</p>
						<p>
							By accessing this app we assume you accept these terms and
							conditions. Do not continue to use The Trick Book if you do not
							agree to take all of the terms and conditions stated on this page.
						</p>
						<p>
							<u>License</u>
							<br />
							Unless otherwise stated, The Trick Book and/or its licensors own
							the intellectual property rights for all material on The Trick
							Book. All intellectual property rights are reserved. You may
							access this from The Trick Book for your own personal use
							subjected to restrictions set in these terms and conditions.
						</p>
						<p>
							<u>User Comments</u>
							<br />
							Certain parts of this app offer the opportunity for users to post
							and exchange opinions and information in certain areas of the
							website. The Trick Book does not filter, edit, publish or review
							Comments prior to their presence on the website. Comments do not
							reflect the views and opinions of The Trick Book, its agents, or
							affiliates. Comments reflect the views and opinions of the person
							who posts their views and opinions. To the extent permitted by
							applicable laws, The Trick Book shall not be liable for the
							Comments or for any liability, damages, or expenses caused and/or
							suffered as a result of any use of and/or posting of and/or
							appearance of the Comments on this website.
						</p>
						<p>
							<u>Hyperlinking to our Content</u>
							<br />
							The following organizations may link to our app without prior
							written approval: Government agencies, Search engines, News
							organizations, Online directory distributors may link to our app
							in the same manner as they hyperlink to the Websites of other
							listed businesses; and System wide Accredited Businesses except
							soliciting non-profit organizations, charity shopping malls, and
							charity fundraising groups which may not hyperlink to our Web
							site.
						</p>
						<p>
							<u>iFrames</u>
							<br />
							Without prior approval and written permission, you may not create
							frames around our Webpages that alter in any way the visual
							presentation or appearance of our App.
						</p>
						<p>
							<u>Content Liability</u>
							<br />
							We shall not be hold responsible for any content that appears on
							your App. You agree to protect and defend us against all claims
							that is rising on your App. No link(s) should appear on any App
							that may be interpreted as libelous, obscene or criminal, or which
							infringes, otherwise violates, or advocates the infringement or
							other violation of, any third party rights.
						</p>
						<p>
							<u>Your Privacy</u>
							<br />
							Please read our Privacy Policy.
						</p>
						<p>
							<u>Reservation of Rights</u>
							<br />
							We reserve the right to request that you remove all links or any
							particular link to our App. You approve to immediately remove all
							links to our App upon request. We also reserve the right to amend
							these terms and conditions and it’s linking policy at any time. By
							continuously linking to our App, you agree to be bound to and
							follow these linking terms and conditions.
						</p>
						<p>
							<u>Removal of links from our App</u>
							<br />
							If you find any link on our App that is offensive for any reason,
							you are free to contact and inform us any moment. We will consider
							requests to remove links but we are not obligated to or so or to
							respond to you directly.
						</p>
					</Typography>

					<Link href='/'>
						<Button variant='outlined' color={"secondary"}>
							<span className='material-icons align-middle'>arrow_back</span>
							Back to home
						</Button>
					</Link>
				</div>
			</div>
		</>
	);
}
