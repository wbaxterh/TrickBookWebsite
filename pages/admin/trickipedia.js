import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import {
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import AdminNav from '../../components/AdminNav';
import { deleteTrick, getSortedTricksData } from '../../lib/apiTrickipedia';
import styles from '../../styles/admin.module.css';

export default function TrickipediaAdmin() {
  const { loggedIn, role, token } = useContext(AuthContext);
  const [tricks, setTricks] = useState([]);
  const [filteredTricks, setFilteredTricks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  const fetchTricks = async () => {
    try {
      const fetchedTricks = await getSortedTricksData();
      // Filter out sample data
      const realTricks = fetchedTricks.filter((trick) => !trick.sampleData);
      setTricks(realTricks);
      setFilteredTricks(realTricks);
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn === null) {
      return;
    }

    if (loggedIn && role === 'admin') {
      fetchTricks();
    } else {
      router.push('/login');
    }
  }, [loggedIn, role, router, fetchTricks]);

  useEffect(() => {
    const filtered = tricks.filter(
      (trick) =>
        trick.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trick.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trick.difficulty.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredTricks(filtered);
  }, [searchTerm, tricks]);

  const handleEdit = (trickId) => {
    router.push({
      pathname: '/admin/create-trick',
      query: { isEdit: true, trickId },
    });
  };

  const handleDelete = async (trickId) => {
    if (!confirm('Are you sure you want to delete this trick?')) {
      return;
    }

    try {
      await deleteTrick(trickId, token);
      setTricks(tricks.filter((trick) => trick.id !== trickId));
      alert('Trick deleted successfully!');
    } catch (_error) {
      alert('Failed to delete trick');
    }
  };

  const handleCreateNewTrick = () => {
    router.push('/admin/create-trick');
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'success';
      case 'Intermediate':
        return 'warning';
      case 'Advanced':
        return 'error';
      case 'Expert':
        return 'secondary';
      default:
        return 'default';
    }
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
    <div className={`container ${styles.container}`}>
      <Head>
        <title>The Trick Book - Trickipedia Administration</title>
      </Head>
      <div className="container m-4 mt-5 pt-3">
        <AdminNav />
        <Typography variant="h2" gutterBottom>
          Manage Trickipedia
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreateNewTrick} className="mb-4">
          Create a New Trick
        </Button>

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

        {filteredTricks.length > 0 ? (
          <div className="row">
            {filteredTricks.map((trick) => (
              <div className="col-md-6 col-lg-4 mb-4" key={trick.id}>
                <div className="card h-100">
                  {trick.images?.[0] && (
                    <img
                      src={trick.images[0]}
                      className="card-img-top"
                      alt={trick.name}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                  )}
                  <div className="card-body">
                    <Typography variant="h5" className="card-title">
                      {trick.name}
                    </Typography>
                    <div className="mb-2">
                      <Chip label={trick.category} color="primary" size="small" className="me-2" />
                      <Chip
                        label={trick.difficulty}
                        color={getDifficultyColor(trick.difficulty)}
                        size="small"
                      />
                    </div>
                    <Typography variant="body2" color="textSecondary">
                      {trick.description?.substring(0, 100)}...
                    </Typography>
                    <div className="mt-3 text-center">
                      <IconButton onClick={() => handleEdit(trick.id)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton onClick={() => handleDelete(trick.id)} color="secondary">
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Typography variant="h6" color="textSecondary">
            No tricks found.
          </Typography>
        )}
      </div>
    </div>
  );
}
