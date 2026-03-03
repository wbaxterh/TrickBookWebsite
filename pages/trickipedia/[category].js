// This file was refactored from skateboarding.js to [category].js for dynamic category routing.

import SearchIcon from '@mui/icons-material/Search';
import { Grid, InputAdornment, TextField, Typography } from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PageHeader from '../../components/PageHeader';
import TrickCard from '../../components/TrickCard';
import { getSortedTricksData } from '../../lib/apiTrickipedia';
import styles from '../../styles/trickipedia.module.css';

export default function CategoryPage() {
  const router = useRouter();
  const { category } = router.query;
  const [tricks, setTricks] = useState([]);
  const [filteredTricks, setFilteredTricks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!category) return;
    const fetchTricks = async () => {
      const tricksData = await getSortedTricksData(
        category.charAt(0).toUpperCase() + category.slice(1),
      );
      setTricks(tricksData);
      setFilteredTricks(tricksData);
    };
    fetchTricks();
  }, [category]);

  useEffect(() => {
    const filtered = tricks.filter(
      (trick) =>
        trick.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trick.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trick.category.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredTricks(filtered);
  }, [searchTerm, tricks]);

  return (
    <>
      <Head>
        <title>
          The Trick Book -{' '}
          {category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'Tricks'}
        </title>
        <link rel="icon" href="/favicon.png" />
        <meta
          name="description"
          content={`The Trick Book - ${
            category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'Tricks'
          } Encyclopedia`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`https://thetrickbook.com/trickipedia/${category || ''}`} />
        <meta name="author" content="Wes Huber" />
        <meta
          name="keywords"
          content={`${category ? category : 'Tricks'}, How to, Tutorial, Action Sports`}
        />
      </Head>
      <div className={`container-fluid ${styles.trickipediaContainer}`}>
        <PageHeader
          title={`${
            category ? category.charAt(0).toUpperCase() + category.slice(1) : 'Tricks'
          } Tricks`}
          col="col-sm-4"
        />

        <div className="container mt-4">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search tricks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            className="mb-4"
          />

          <Grid container spacing={3}>
            {filteredTricks.map((trick) => (
              <Grid item xs={12} sm={6} md={4} key={trick.id}>
                <TrickCard
                  id={trick.id}
                  name={trick.name}
                  category={trick.category}
                  difficulty={trick.difficulty}
                  description={trick.description}
                  images={trick.images}
                  url={`/trickipedia/${category}/${trick.url || trick.id}`}
                />
              </Grid>
            ))}
          </Grid>

          {filteredTricks.length === 0 && (
            <Typography variant="h6" className="text-center mt-4">
              No tricks found matching your search.
            </Typography>
          )}
        </div>
      </div>
    </>
  );
}
