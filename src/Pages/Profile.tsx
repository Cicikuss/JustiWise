import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  MenuItem
} from '@mui/material';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import { useAuth } from '../Context/AuthContext';
import { updateUser, uploadImage } from '../service/supabaseClient';

const roles = ['client', 'lawyer', 'student']; 

const Profile: React.FC = () => {
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [editedUser, setEditedUser] = useState({
    username: user?.username || '',
    role: user?.role || '',
    profile_image_url: user?.profile_image_url || '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(user?.profile_image_url || '');

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
  };

  

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

 const handleSave = async () => {
  console.log('Kaydedilen veriler:', editedUser);

  let imageUrl = editedUser.profile_image_url;

  if (selectedImage) {
    try {
      imageUrl = await uploadImage(selectedImage);
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      return;
    }
  }

  await updateUser(user!.id, {
    profile_image_url: imageUrl,
    username: editedUser.username,
    role: editedUser.role,
  });

  handleClose();
};


  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Profil
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Avatar src={previewUrl} sx={{ width: 120, height: 120 }} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {user?.username}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              <strong>E-posta:</strong> {user?.email}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              <strong>Rol:</strong> {user?.role}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              <strong>Katılma Tarihi:</strong> {user?.created_at}
            </Typography>
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="flex-end">
            <Button variant="contained" onClick={handleOpen}>
              Profili Düzenle
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Profili Düzenle</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <Box display="flex" justifyContent="center">
            <Avatar src={previewUrl} sx={{ width: 100, height: 100 }} />
          </Box>
          <Box display="flex" justifyContent="center">
            <input
              accept="image/*"
              id="profile-image-upload"
              type="file"
              hidden
              onChange={handleImageChange}
            />
            <label htmlFor="profile-image-upload">
              <IconButton color="primary" component="span">
                <PhotoCamera />
              </IconButton>
            </label>
          </Box>

          <TextField
            label="Kullanıcı Adı"
            name="username"
            value={editedUser.username}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Rol"
            name="role"
            value={editedUser.role}
            onChange={handleChange}
            select
            fullWidth
          >
            {roles.map((role) => (
              <MenuItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>İptal</Button>
          <Button onClick={handleSave} variant="contained">
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Profile;
