import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../auth/AuthContext';
import { getCategories } from '../../lib/api';
import { createTrick, getTrickData, updateTrick, uploadTrickImage } from '../../lib/apiTrickipedia';
import styles from '../../styles/admin.module.css';

export default function CreateTrick() {
  const { token, loggedIn, role } = useContext(AuthContext);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState(['']);
  const [videoUrl, setVideoUrl] = useState('');
  const [source, setSource] = useState('');
  const [url, setUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isEdit, trickId } = router.query;

  const fetchTrickData = async (id) => {
    try {
      const trickData = await getTrickData(id);
      setName(trickData.name);
      setCategory(trickData.category);
      setDifficulty(trickData.difficulty);
      setDescription(trickData.description);
      setSteps(trickData.steps || ['']);
      setVideoUrl(trickData.videoUrl || '');
      setSource(trickData.source || '');
      setUrl(trickData.url || '');
      setExistingImages(trickData.images || []);
      setLoading(false);
    } catch (_error) {}
  };

  const fetchCategories = async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (_error) {}
  };

  useEffect(() => {
    if (isEdit && trickId) {
      fetchTrickData(trickId);
    } else {
      setLoading(false);
    }
    fetchCategories();
  }, [isEdit, trickId, fetchCategories, fetchTrickData]);

  const handleFileChange = (event) => {
    setSelectedFiles([...selectedFiles, ...event.target.files]);
  };

  const handleRemoveImage = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

  const handleRemoveExistingImage = (index) => {
    const updatedImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(updatedImages);
  };

  const addStep = () => {
    setSteps([...steps, '']);
  };

  const removeStep = (index) => {
    if (steps.length > 1) {
      const updatedSteps = steps.filter((_, i) => i !== index);
      setSteps(updatedSteps);
    }
  };

  const updateStep = (index, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index] = value;
    setSteps(updatedSteps);
  };

  const generateUrl = (trickName) => {
    return trickName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Generate URL if not provided
    const finalUrl = url || generateUrl(name);

    // Create the base trick data
    const trickData = {
      name,
      category,
      difficulty,
      description,
      steps: steps.filter((step) => step.trim() !== ''),
      videoUrl,
      source,
      url: finalUrl,
      images: [...existingImages], // Start with existing images
    };

    try {
      let trickResponse;

      // If it's an edit, update the trick data
      if (isEdit === 'true') {
        await updateTrick(trickId, trickData, token);
        trickResponse = { _id: trickId, url: finalUrl };
        alert('Trick updated successfully!');
      } else {
        // Create a new trick
        trickResponse = await createTrick(trickData, token);
        alert('Trick created successfully!');
      }

      // Handle image uploads for new files
      const imageUrls = [...existingImages];
      for (const file of selectedFiles) {
        const imageUrl = await uploadTrickImage(file, finalUrl, token);
        imageUrls.push(imageUrl);
      }

      // Update the trick with all image URLs (include all trick data)
      if (selectedFiles.length > 0) {
        const updatedTrickData = {
          ...trickData,
          images: imageUrls,
        };
        await updateTrick(trickResponse._id, updatedTrickData, token);
        alert('Images uploaded and trick updated successfully!');
      }

      router.push('/admin/trickipedia');
    } catch (_error) {
      alert('Failed to submit trick');
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
        <title>{isEdit === 'true' ? 'Edit' : 'Create'} Trick</title>
      </Head>
      <div className="container m-4 mt-5 pt-3">
        <Typography variant="h2" gutterBottom>
          {isEdit === 'true' ? 'Edit' : 'Create'} Trick
        </Typography>
        <form onSubmit={handleSubmit} className={styles.form}>
          <TextField
            label="Trick Name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!url) {
                setUrl(generateUrl(e.target.value));
              }
            }}
            fullWidth
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Category</InputLabel>
            <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Category">
              {categories.map((cat) => (
                <MenuItem key={cat._id} value={cat.name}>
                  {cat.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" required>
            <InputLabel>Difficulty</InputLabel>
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              label="Difficulty"
            >
              <MenuItem value="Beginner">Beginner</MenuItem>
              <MenuItem value="Intermediate">Intermediate</MenuItem>
              <MenuItem value="Advanced">Advanced</MenuItem>
              <MenuItem value="Expert">Expert</MenuItem>
            </Select>
          </FormControl>

          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            margin="normal"
            multiline
            rows={3}
            required
          />

          <TextField
            label="URL Slug"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            fullWidth
            margin="normal"
            helperText="URL-friendly version of the trick name"
          />

          <TextField
            label="Video URL"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="https://www.youtube.com/watch?v=..."
          />

          <TextField
            label="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            fullWidth
            margin="normal"
            placeholder="e.g., Official, Community, etc."
          />

          <Typography variant="h6" className="mt-4 mb-2">
            Steps:
          </Typography>
          {steps.map((step, index) => (
            <Box key={index} className="d-flex align-items-center mb-2">
              <TextField
                label={`Step ${index + 1}`}
                value={step}
                onChange={(e) => updateStep(index, e.target.value)}
                fullWidth
                margin="normal"
                required
              />
              {steps.length > 1 && (
                <IconButton onClick={() => removeStep(index)} color="secondary" className="ms-2">
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
          ))}
          <Button type="button" variant="outlined" onClick={addStep} className="mb-4">
            Add Step
          </Button>

          <Typography variant="h6" className="mt-4 mb-2">
            Images:
          </Typography>

          {/* Existing Images */}
          {existingImages.length > 0 && (
            <div className="mb-3">
              <Typography variant="subtitle1">Existing Images:</Typography>
              <div className="row">
                {existingImages.map((image, index) => (
                  <div key={index} className="col-md-3 mb-2">
                    <div className="position-relative">
                      <img
                        src={image}
                        alt={`${name} ${index + 1}`}
                        className="img-fluid rounded"
                        style={{ height: '150px', objectFit: 'cover' }}
                      />
                      <IconButton
                        onClick={() => handleRemoveExistingImage(index)}
                        color="secondary"
                        size="small"
                        className="position-absolute top-0 end-0"
                        style={{ backgroundColor: 'rgba(255,255,255,0.8)' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          <div className="row">
            <div className="col-6 mx-auto text-center">
              <h3>Add New Images</h3>
              <input type="file" onChange={handleFileChange} multiple />
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="row mt-4">
              {selectedFiles.map((file, index) => (
                <div key={index} className="col-6 mx-auto text-center">
                  <Typography>{file.name}</Typography>
                  <IconButton color="secondary" onClick={() => handleRemoveImage(index)}>
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
            </div>
          )}

          <div className="row mt-4">
            <Button type="submit" className="col-6 mx-auto" variant="contained" color="primary">
              {isEdit === 'true' ? 'Update Trick' : 'Create Trick'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
