import React, { useState, useEffect } from 'react'; // useEffect'i ekledik
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
import { showErrorToast } from '../Helper/ErrorHandler';

const roles = ['client', 'lawyer', 'student'];

const Profile: React.FC = () => {
  const { user } = useAuth();

  // State'leri başlangıçta boş bırakabiliriz, çünkü useEffect ile dolduracağız.
  // Veya geçici "Yükleniyor..." durumlarını koruyabiliriz.
  const [editedUser, setEditedUser] = useState({
    username: '',
    role: '',
    profile_image_url: '',
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(''); // Başlangıçta boş

  const [open, setOpen] = useState(false);

  // Bu useEffect kancası, `user` objesi değiştiğinde (yani yüklendiğinde) çalışacak.
  useEffect(() => {
    if (user) {
      // Kullanıcı bilgisi yüklendiğinde state'leri doldur
      setEditedUser({
        username: user.username || '',
        role: user.role || '',
        profile_image_url: user.profile_image_url || '',
      });
      // Önizleme URL'sini de kullanıcının mevcut profil resmine ayarla
      setPreviewUrl(user.profile_image_url || '');
    }
  }, [user]); // user objesi değiştiğinde bu effect'i tekrar çalıştır

  // user objesi henüz yüklenmediyse yükleniyor mesajı göster
  // Bu kontrolü, useEffect'in hemen üstüne almak daha mantıklı.
  if (!user || editedUser.username === '') { // editedUser.username kontrolü de user verisinin gelip gelmediğini anlamak için eklenebilir
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Typography>Yükleniyor...</Typography>
        </Box>
    );
  }

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setSelectedImage(null);
    // Dialog kapatıldığında, editedUser state'ini en son kaydedilen kullanıcı verisiyle senkronize et
    // Bu, eğer kullanıcı değişiklik yapıp kaydetmeden kapatırsa, eski değerlerin geri gelmesini sağlar.
    if (user) {
        setEditedUser({
            username: user.username || '',
            role: user.role || '',
            profile_image_url: user.profile_image_url || '',
        });
        setPreviewUrl(user.profile_image_url || '');
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedUser({ ...editedUser, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // Yeni seçilen resmin önizlemesini göster
    }
  };

  const handleSave = async () => {
    console.log('Kaydedilen veriler:', editedUser);

    let imageUrl = editedUser.profile_image_url; // Varsayılan olarak mevcut URL

    if (selectedImage) {
      try {
        imageUrl = await uploadImage(selectedImage);
      } catch (error) {
        showErrorToast(error);
        return;
      }
    }

    // `user!.id` yerine `user.id` kullanabiliriz çünkü yukarıda `if (!user)` kontrolü var.
    await updateUser(user.id, {
      profile_image_url: imageUrl,
      username: editedUser.username,
      role: editedUser.role,
    });

    handleClose(); // Kaydettikten sonra dialogu kapat
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Profil
      </Typography>

      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="center">
            {/* Avatar kaynağı olarak `previewUrl` kullanıyoruz, bu sayede hem mevcut resim hem de yeni seçilen resim görünecek */}
            <Avatar src={previewUrl} sx={{ width: 120, height: 120 }} />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {editedUser.username} {/* editedUser.username kullanın */}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              <strong>E-posta:</strong> {user.email}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              <strong>Rol:</strong> {editedUser.role} {/* editedUser.role kullanın */}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              <strong>Katılma Tarihi:</strong> {new Date(user.created_at).toLocaleString("tr-TR", {
  dateStyle: "medium",
  timeStyle: "short",
})}
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
            value={editedUser.username} // Düzenlenecek değer editedUser'dan gelmeli
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Rol"
            name="role"
            value={editedUser.role} // Düzenlenecek değer editedUser'dan gelmeli
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