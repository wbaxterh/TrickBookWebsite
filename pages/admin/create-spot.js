import {
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { createSpot, getSpotData, updateSpot } from '../../lib/apiSpots';
import styles from '../../styles/admin.module.css';

const AVAILABLE_TAGS = ['bowl', 'street', 'lights', 'indoor', 'beginner', 'advanced'];

// US States for dropdown
const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' },
  { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' },
  { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' },
  { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' },
  { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' },
  { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' },
  { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' },
  { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' },
  { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' },
  { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' },
  { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' },
  { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' },
  { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' },
  { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' },
  { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' },
  { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' },
  { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' },
  { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' },
  { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' },
  { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' },
  { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'Washington D.C.' },
];

export default function CreateSpot() {
  const { token, loggedIn, role } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [description, setDescription] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { isEdit, spotId } = router.query;

  const fetchSpotData = async (id) => {
    try {
      const spotData = await getSpotData(id);
      if (spotData) {
        setName(spotData.name || '');
        setLatitude(spotData.latitude?.toString() || '');
        setLongitude(spotData.longitude?.toString() || '');
        setCity(spotData.city || '');
        setState(spotData.state || '');
        setDescription(spotData.description || '');
        setImageURL(spotData.imageURL || '');
        setRating(spotData.rating?.toString() || '');

        // Parse tags
        if (spotData.tags) {
          const tagList =
            typeof spotData.tags === 'string'
              ? spotData.tags
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean)
              : spotData.tags;
          setSelectedTags(tagList);
        }
      }
      setLoading(false);
    } catch (_error) {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (loggedIn === null) return;

    if (!loggedIn || role !== 'admin') {
      router.push('/login');
      return;
    }

    if (isEdit && spotId) {
      fetchSpotData(spotId);
    } else {
      setLoading(false);
    }
  }, [isEdit, spotId, loggedIn, role, router, fetchSpotData]);

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const spotData = {
      name,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      city,
      state,
      description,
      imageURL: imageURL || null,
      tags: selectedTags.join(', '),
      rating: rating ? parseFloat(rating) : null,
    };

    try {
      if (isEdit === 'true') {
        await updateSpot(spotId, spotData, token);
        alert('Spot updated successfully!');
      } else {
        await createSpot(spotData, token);
        alert('Spot created successfully!');
      }

      router.push('/admin/spots');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to submit spot');
    } finally {
      setSubmitting(false);
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
        <title>{isEdit === 'true' ? 'Edit' : 'Create'} Spot</title>
      </Head>
      <div className="container m-4 mt-5 pt-3">
        <Button
          variant="text"
          onClick={() => router.push('/admin/spots')}
          sx={{ mb: 2, color: '#FFF000' }}
        >
          &larr; Back to Spots
        </Button>

        <Typography variant="h2" gutterBottom>
          {isEdit === 'true' ? 'Edit' : 'Create'} Spot
        </Typography>
        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Spot Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            margin="normal"
            required
          />

          <Box display="flex" gap={2}>
            <TextField
              label="Latitude"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              fullWidth
              margin="normal"
              required
              type="number"
              inputProps={{ step: 'any' }}
              placeholder="e.g., 40.7128"
            />
            <TextField
              label="Longitude"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              fullWidth
              margin="normal"
              required
              type="number"
              inputProps={{ step: 'any' }}
              placeholder="e.g., -74.0060"
            />
          </Box>

          <Box display="flex" gap={2}>
            <TextField
              label="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              fullWidth
              margin="normal"
            />
            <FormControl fullWidth margin="normal">
              <InputLabel>State</InputLabel>
              <Select value={state} onChange={(e) => setState(e.target.value)} label="State">
                {US_STATES.map((s) => (
                  <MenuItem key={s.code} value={s.code}>
                    {s.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
          />

          <TextField
            label="Image URL"
            value={imageURL}
            onChange={(e) => setImageURL(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="https://example.com/image.jpg"
          />

          {imageURL && (
            <Box my={2}>
              <Typography variant="subtitle2" gutterBottom>
                Image Preview:
              </Typography>
              <div style={{ position: 'relative', width: '200px', height: '150px' }}>
                <Image
                  src={imageURL}
                  alt="Spot preview"
                  fill
                  style={{ objectFit: 'cover', borderRadius: '8px' }}
                  unoptimized
                />
              </div>
            </Box>
          )}

          <TextField
            label="Rating"
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            fullWidth
            margin="normal"
            type="number"
            inputProps={{ min: 0, max: 5, step: 0.5 }}
            placeholder="0-5"
          />

          <Typography variant="h6" className="mt-4 mb-2">
            Tags:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mb={3}>
            {AVAILABLE_TAGS.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                clickable
                onClick={() => handleTagToggle(tag)}
                sx={{
                  backgroundColor: selectedTags.includes(tag) ? '#fff000' : '#e0e0e0',
                  color: selectedTags.includes(tag) ? '#1f1f1f' : '#333',
                  '&:hover': {
                    backgroundColor: selectedTags.includes(tag) ? '#e6d900' : '#d0d0d0',
                  },
                }}
              />
            ))}
          </Box>

          <div className="row mt-4">
            <Button
              type="submit"
              className="col-6 mx-auto"
              variant="contained"
              color="primary"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : isEdit === 'true' ? 'Update Spot' : 'Create Spot'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
