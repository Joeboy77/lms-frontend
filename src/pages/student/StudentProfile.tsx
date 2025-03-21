import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import axios from 'axios';

interface StudentProfile {
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  profile_picture: string | null;
}

const StudentProfile = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        'https://lms-backend-cntm.onrender.com/api/student/profile',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({
        ...profile,
        [e.target.name]: e.target.value
      });
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      await axios.put(
        'https://lms-backend-cntm.onrender.com/api/student/profile',
        profile,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess(true);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setSuccess(false);
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const formData = new FormData();
      formData.append('profile_picture', e.target.files[0]);
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(
          'https://lms-backend-cntm.onrender.com/api/student/profile-picture',
          formData,
          { 
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            } 
          }
        );

        // Update the profile state with the new picture URL
        setProfile(prev => prev ? {
          ...prev,
          profile_picture: response.data.profile_picture
        } : null);
        
        setSuccess(true);
        setMessage('Profile picture updated successfully!');
      } catch (error) {
        setSuccess(false);
        setMessage('Failed to update profile picture');
        console.error('Error updating profile picture:', error);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto' }}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Avatar
              sx={{
                width: 100,
                height: 100,
                bgcolor: '#81c784',
                fontSize: '2rem'
              }}
            >
              {profile?.first_name.charAt(0)}
            </Avatar>
          </Grid>
          
          {message && (
            <Grid item xs={12}>
              <Alert severity={success ? "success" : "error"}>
                {message}
              </Alert>
            </Grid>
          )}

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              name="first_name"
              value={profile?.first_name || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              name="last_name"
              value={profile?.last_name || ''}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              value={profile?.email || ''}
              onChange={handleChange}
              type="email"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={profile?.username || ''}
              disabled
            />
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={saving}
              fullWidth
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default StudentProfile; 