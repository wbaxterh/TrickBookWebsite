import { Box, Chip, CircularProgress, MenuItem, Paper, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../../auth/AuthContext';
import AdminNav from '../../components/AdminNav';
import { getLatestSpotRuns, getSpotRuns } from '../../lib/apiSpotEnrichment';

export default function SpotEnrichmentAdmin() {
  const { loggedIn, role, token } = useContext(AuthContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [latest, setLatest] = useState([]);
  const [runs, setRuns] = useState([]);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (loggedIn === null) return;
    if (!loggedIn || role !== 'admin') router.push('/login');
  }, [loggedIn, role, router]);

  useEffect(() => {
    if (!token || role !== 'admin') return;
    (async () => {
      setLoading(true);
      try {
        const [l, h] = await Promise.all([
          getLatestSpotRuns(token),
          getSpotRuns({ type, status, page: 1, limit: 50 }, token),
        ]);
        setLatest(l || []);
        setRuns(h.items || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [token, role, type, status]);

  if (loading) return <CircularProgress />;

  return <div className="container mt-5"><AdminNav />
    <Typography variant="h4" gutterBottom>Spot Enrichment Runs</Typography>
    <Box display="flex" gap={2} mb={2}>
      <TextField select label="Type" value={type} onChange={(e) => setType(e.target.value)} sx={{ minWidth: 180 }}>
        <MenuItem value="">All</MenuItem><MenuItem value="heavy">Heavy</MenuItem><MenuItem value="light">Light</MenuItem><MenuItem value="weekly">Weekly</MenuItem>
      </TextField>
      <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 180 }}>
        <MenuItem value="">All</MenuItem><MenuItem value="success">Success</MenuItem><MenuItem value="partial">Partial</MenuItem><MenuItem value="failed">Failed</MenuItem><MenuItem value="running">Running</MenuItem>
      </TextField>
    </Box>
    <Box display="flex" gap={2} mb={3} flexWrap="wrap">
      {latest.map((r) => <Paper key={r._id} sx={{ p: 2, minWidth: 220 }}><Typography variant="subtitle2">{r.type?.toUpperCase()}</Typography><Chip label={r.status} /><Typography variant="body2">{new Date(r.startedAt).toLocaleString()}</Typography></Paper>)}
    </Box>
    <Table size="small"><TableHead><TableRow><TableCell>Started</TableCell><TableCell>Type</TableCell><TableCell>Status</TableCell><TableCell>Counts</TableCell><TableCell>Details</TableCell></TableRow></TableHead><TableBody>
      {runs.map((r) => <TableRow key={r._id}><TableCell>{new Date(r.startedAt).toLocaleString()}</TableCell><TableCell>{r.type}</TableCell><TableCell>{r.status}</TableCell><TableCell>{`a:${r.counts?.added || 0} u:${r.counts?.updated || 0} s:${r.counts?.skipped || 0} f:${r.counts?.failed || 0}`}</TableCell><TableCell><details><summary>View</summary><pre style={{ whiteSpace: 'pre-wrap', maxWidth: 600 }}>{JSON.stringify({ addedSpots: r.addedSpots, failedSpots: r.failedSpots, stderrSummary: r.stderrSummary }, null, 2)}</pre></details></TableCell></TableRow>)}
    </TableBody></Table>
  </div>;
}
