import { PlaylistAdd } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Snackbar,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import PageHeader from '../../../components/PageHeader';
import { getSortedTricksData } from '../../../lib/apiTrickipedia';
import { addTrickFromTrickipedia, getUserTrickLists } from '../../../lib/apiTrickLists';
import styles from '../../../styles/trickipedia.module.css';

export default function TrickDetailPage() {
  const router = useRouter();
  const { category, trick } = router.query;
  const { loggedIn, token, userId } = useContext(AuthContext);

  const [trickData, setTrickData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Add to TrickList modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [userLists, setUserLists] = useState([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [adding, setAdding] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    if (!category || !trick) return;
    const fetchTrick = async () => {
      const tricks = await getSortedTricksData(
        category.charAt(0).toUpperCase() + category.slice(1),
      );
      const found = tricks.find((t) => t.url === trick || t.id === trick);
      setTrickData(found || null);
      setLoading(false);
    };
    fetchTrick();
  }, [category, trick]);

  // Fetch user's trick lists when modal opens
  const handleOpenAddModal = async () => {
    if (!loggedIn) {
      router.push('/login');
      return;
    }
    setAddModalOpen(true);
    setLoadingLists(true);
    try {
      const lists = await getUserTrickLists(userId, token);
      setUserLists(lists || []);
    } catch (_error) {
      setSnackbar({ open: true, message: 'Failed to load your trick lists', severity: 'error' });
    } finally {
      setLoadingLists(false);
    }
  };

  // Add trick to selected list
  const handleAddToList = async (listId) => {
    setAdding(true);
    try {
      await addTrickFromTrickipedia(listId, trickData, token);
      setSnackbar({
        open: true,
        message: `Added "${trickData.name}" to your list!`,
        severity: 'success',
      });
      setAddModalOpen(false);
    } catch (_error) {
      setSnackbar({ open: true, message: 'Failed to add trick to list', severity: 'error' });
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return <Typography variant="h5">Loading...</Typography>;
  }

  if (!trickData) {
    return (
      <Container className="py-5">
        <Typography variant="h2" color="error" align="center">
          404
        </Typography>
        <Typography variant="h5" align="center">
          This trick could not be found.
        </Typography>
      </Container>
    );
  }

  return (
    <>
      <Head>
        <title>{trickData.name} - The Trick Book</title>
        <meta name="description" content={trickData.description} />
      </Head>
      <Container maxWidth="md" sx={{ maxWidth: 700, px: { xs: 2, md: 4 }, py: 4 }}>
        <div className={styles.trickipediaContainer} style={{ padding: 0 }}>
          <PageHeader title={trickData.name} col="col-sm-4" />
          <Box
            className="my-4"
            display="flex"
            gap={2}
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
          >
            <Box display="flex" gap={2}>
              <Chip label={trickData.category} color="primary" className="me-2" />
              <Chip label={trickData.difficulty} color="secondary" />
            </Box>
            <Button
              variant="contained"
              startIcon={<PlaylistAdd />}
              onClick={handleOpenAddModal}
              sx={{
                backgroundColor: '#FFD700',
                color: '#000',
                '&:hover': { backgroundColor: '#FFC700' },
                fontWeight: 600,
              }}
            >
              Add to TrickList
            </Button>
          </Box>
          <Typography variant="h5" className="mb-3">
            {trickData.description}
          </Typography>
          {trickData.images && trickData.images.length > 0 && (
            <img
              src={trickData.images[0]}
              alt={trickData.name}
              style={{
                display: 'block',
                maxWidth: 400,
                width: '100%',
                borderRadius: 8,
                margin: '24px auto',
              }}
            />
          )}
          <Box className="mb-4">
            <Typography variant="h6">Steps:</Typography>
            <ol>
              {trickData.steps?.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </Box>
          {trickData.videoUrl && (
            <Box className="mb-4">
              <Typography variant="h6">Video Tutorial:</Typography>
              <a href={trickData.videoUrl} target="_blank" rel="noopener noreferrer">
                {trickData.videoUrl}
              </a>
            </Box>
          )}
          {trickData.source && (
            <Typography variant="body2" color="textSecondary">
              Source: {trickData.source}
            </Typography>
          )}
        </div>
      </Container>

      {/* Add to TrickList Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add to TrickList</DialogTitle>
        <DialogContent>
          {loadingLists ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress sx={{ color: '#FFD700' }} />
            </Box>
          ) : userLists.length > 0 ? (
            <List>
              {userLists.map((list) => (
                <ListItem key={list._id} disablePadding>
                  <ListItemButton onClick={() => handleAddToList(list._id)} disabled={adding}>
                    <ListItemText
                      primary={list.name}
                      secondary={`${list.tricks?.length || 0} tricks`}
                    />
                    {adding && <CircularProgress size={20} sx={{ color: '#FFD700' }} />}
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box textAlign="center" py={4}>
              <Typography variant="body1" color="textSecondary" gutterBottom>
                You don&apos;t have any trick lists yet.
              </Typography>
              <Button variant="outlined" onClick={() => router.push('/trickbook')} sx={{ mt: 2 }}>
                Go to My TrickLists
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModalOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
