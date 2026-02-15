import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  InputAdornment,
  Pagination,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import AdminNav from '../../components/AdminNav';
import { deleteSpot, searchSpots } from '../../lib/apiSpots';
import styles from '../../styles/admin.module.css';

// US State names mapping
const STATE_NAMES = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'Washington D.C.',
};

export default function SpotsAdmin() {
  const { loggedIn, role, token } = useContext(AuthContext);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    totalCount: 0,
    totalPages: 0,
  });
  const router = useRouter();

  const fetchSpots = async () => {
    setLoading(true);
    try {
      const data = await searchSpots(searchTerm, '', '', '', pagination.page, 20);
      setSpots(data.spots || []);
      setPagination(data.pagination || { page: 1, totalCount: 0, totalPages: 0 });
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
      fetchSpots();
    } else {
      router.push('/login');
    }
  }, [loggedIn, role, router, fetchSpots]);

  useEffect(() => {
    if (loggedIn && role === 'admin') {
      const debounceTimer = setTimeout(() => {
        fetchSpots();
      }, 300);
      return () => clearTimeout(debounceTimer);
    }
  }, [fetchSpots, loggedIn, role]);

  const handleEdit = (spotId) => {
    router.push({
      pathname: '/admin/create-spot',
      query: { isEdit: true, spotId },
    });
  };

  const handleDelete = async (spotId) => {
    if (
      !confirm(
        'Are you sure you want to delete this spot? This will remove it from all user lists.',
      )
    ) {
      return;
    }

    try {
      await deleteSpot(spotId, token);
      setSpots(spots.filter((spot) => spot._id !== spotId));
      alert('Spot deleted successfully!');
    } catch (_error) {
      alert('Failed to delete spot');
    }
  };

  const handleCreateNewSpot = () => {
    router.push('/admin/create-spot');
  };

  const handlePageChange = (_event, value) => {
    setPagination((prev) => ({ ...prev, page: value }));
  };

  // Parse tags helper
  const parseTags = (tags) => {
    if (!tags) return [];
    return typeof tags === 'string'
      ? tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      : tags;
  };

  if (loading && spots.length === 0) {
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
        <title>The Trick Book - Spots Administration</title>
      </Head>
      <div className="container m-4 mt-5 pt-3">
        <AdminNav />
        <Typography variant="h2" gutterBottom>
          Manage Spots
        </Typography>
        <Typography variant="body1" color="textSecondary" className="mb-4">
          {pagination.totalCount} total spots
        </Typography>
        <Button variant="contained" color="primary" onClick={handleCreateNewSpot} className="mb-4">
          Create a New Spot
        </Button>

        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search spots by name, city, or state..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPagination((prev) => ({ ...prev, page: 1 }));
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          className="mb-4"
        />

        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : spots.length > 0 ? (
          <>
            <div className="row">
              {spots.map((spot) => (
                <div className="col-md-6 col-lg-4 mb-4" key={spot._id}>
                  <div className="card h-100">
                    <div style={{ position: 'relative', height: '180px' }}>
                      {spot.imageURL ? (
                        <Image
                          src={spot.imageURL}
                          alt={spot.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          unoptimized
                          className="card-img-top"
                        />
                      ) : (
                        <div
                          style={{
                            height: '180px',
                            backgroundColor: '#2a2a2a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <LocationOnIcon sx={{ fontSize: 60, color: '#fff000' }} />
                        </div>
                      )}
                    </div>
                    <div className="card-body">
                      <Typography variant="h5" className="card-title">
                        {spot.name}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                        <LocationOnIcon sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" color="textSecondary">
                          {spot.city && spot.state
                            ? `${spot.city}, ${STATE_NAMES[spot.state] || spot.state}`
                            : spot.state
                              ? STATE_NAMES[spot.state] || spot.state
                              : 'Unknown'}
                        </Typography>
                      </Box>
                      <div className="mb-2">
                        {parseTags(spot.tags)
                          .slice(0, 3)
                          .map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              size="small"
                              className="me-1 mb-1"
                              sx={{ fontSize: '0.7rem' }}
                            />
                          ))}
                      </div>
                      {spot.description && (
                        <Typography variant="body2" color="textSecondary">
                          {spot.description.substring(0, 80)}
                          {spot.description.length > 80 ? '...' : ''}
                        </Typography>
                      )}
                      <div className="mt-3 text-center">
                        <IconButton onClick={() => handleEdit(spot._id)} color="primary">
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(spot._id)} color="secondary">
                          <DeleteIcon />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={pagination.totalPages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      color: '#1f1f1f',
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#fff000 !important',
                    },
                  }}
                />
              </Box>
            )}
          </>
        ) : (
          <Typography variant="h6" color="textSecondary">
            No spots found.
          </Typography>
        )}
      </div>
    </div>
  );
}
