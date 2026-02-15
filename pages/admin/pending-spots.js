import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
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
import { approveSpot, deleteSpot, getPendingSpots, rejectSpot } from '../../lib/apiSpots';
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

export default function PendingSpotsAdmin() {
  const { loggedIn, role, token } = useContext(AuthContext);
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalCount: 0,
    totalPages: 0,
  });
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (loggedIn === null) {
      return;
    }

    if (loggedIn && role === 'admin') {
      fetchPendingSpots();
    } else {
      router.push('/login');
    }
  }, [loggedIn, role, router, fetchPendingSpots]);

  useEffect(() => {
    if (loggedIn && role === 'admin') {
      fetchPendingSpots();
    }
  }, [fetchPendingSpots, loggedIn, role]);

  const fetchPendingSpots = async () => {
    setLoading(true);
    try {
      const data = await getPendingSpots(token, pagination.page, 20);
      setSpots(data.spots || []);
      setPagination(data.pagination || { page: 1, totalCount: 0, totalPages: 0 });
    } catch (_error) {
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (spotId) => {
    if (!confirm('Are you sure you want to approve this spot for public listing?')) {
      return;
    }

    setProcessing(true);
    try {
      await approveSpot(spotId, token);
      setSpots(spots.filter((spot) => spot._id !== spotId));
      alert('Spot approved successfully!');
    } catch (_error) {
      alert('Failed to approve spot');
    } finally {
      setProcessing(false);
    }
  };

  const openRejectDialog = (spot) => {
    setSelectedSpot(spot);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleReject = async () => {
    if (!selectedSpot) return;

    setProcessing(true);
    try {
      await rejectSpot(selectedSpot._id, rejectionReason, token);
      setSpots(spots.filter((spot) => spot._id !== selectedSpot._id));
      setRejectDialogOpen(false);
      alert('Spot rejected successfully!');
    } catch (_error) {
      alert('Failed to reject spot');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (spotId) => {
    if (!confirm('Are you sure you want to delete this spot? This cannot be undone.')) {
      return;
    }

    setProcessing(true);
    try {
      await deleteSpot(spotId, token);
      setSpots(spots.filter((spot) => spot._id !== spotId));
      alert('Spot deleted successfully!');
    } catch (_error) {
      alert('Failed to delete spot');
    } finally {
      setProcessing(false);
    }
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

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return 'Unknown';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
        <title>The Trick Book - Pending Spots Review</title>
      </Head>
      <div className="container m-4 mt-5 pt-3">
        <AdminNav />
        <Typography variant="h2" gutterBottom>
          Pending Spot Submissions
        </Typography>
        <Typography variant="body1" color="textSecondary" className="mb-4">
          {pagination.totalCount} spots awaiting review
        </Typography>

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
                      <Chip
                        label="Pending"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          backgroundColor: '#ff9800',
                          color: 'white',
                        }}
                      />
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
                      <Box display="flex" alignItems="center" gap={0.5} mb={2}>
                        <AccessTimeIcon sx={{ fontSize: 16, color: '#666' }} />
                        <Typography variant="body2" color="textSecondary">
                          Submitted: {formatDate(spot.submittedAt || spot.createdAt)}
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
                        <Typography variant="body2" color="textSecondary" className="mb-2">
                          {spot.description.substring(0, 100)}
                          {spot.description.length > 100 ? '...' : ''}
                        </Typography>
                      )}
                      <Box display="flex" alignItems="center" gap={1} mt={2}>
                        <Typography variant="caption" color="textSecondary">
                          Lat: {spot.latitude?.toFixed(4)}, Lon: {spot.longitude?.toFixed(4)}
                        </Typography>
                      </Box>
                      <div className="mt-3 text-center">
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApprove(spot._id)}
                          disabled={processing}
                          sx={{ mr: 1 }}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          startIcon={<CancelIcon />}
                          onClick={() => openRejectDialog(spot)}
                          disabled={processing}
                          sx={{ mr: 1 }}
                        >
                          Reject
                        </Button>
                        <IconButton
                          onClick={() => handleDelete(spot._id)}
                          color="error"
                          disabled={processing}
                          size="small"
                        >
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
          <Box textAlign="center" py={6}>
            <CheckCircleIcon sx={{ fontSize: 80, color: '#4caf50', mb: 2 }} />
            <Typography variant="h5" color="textSecondary">
              No pending spots to review
            </Typography>
            <Typography variant="body1" color="textSecondary">
              All submissions have been processed.
            </Typography>
          </Box>
        )}
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)}>
        <DialogTitle>Reject Spot Submission</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="textSecondary" className="mb-3">
            Rejecting: {selectedSpot?.name}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Rejection Reason (optional)"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Provide feedback for the submitter..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)} disabled={processing}>
            Cancel
          </Button>
          <Button onClick={handleReject} color="warning" variant="contained" disabled={processing}>
            {processing ? <CircularProgress size={20} /> : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
