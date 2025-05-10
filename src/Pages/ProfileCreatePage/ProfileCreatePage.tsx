import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Avatar,
  Box,
} from '@mui/material';
import { useThemeContext } from '../../Context/ThemeContext';


type FormData = {
  username: string;
  email: string;
  phone: string;
  profilePicture: File | null;
};

const CreateProfilePage: React.FC = () => {


  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    phone: '',
    profilePicture: null,
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (
    e: ChangeEvent<HTMLInputElement>
  ): void => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prevData) => ({
      ...prevData,
      profilePicture: file,
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Gönderilen Veriler:', formData);
    // Burada API çağrısı yapılabilir
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 4 }}>
      <Box display="flex" justifyContent="center" mb={2}>
        <Avatar
          sx={{ width: 100, height: 100 }}
          src={
            formData.profilePicture
              ? URL.createObjectURL(formData.profilePicture)
              : undefined
          }
        />
      </Box>

      <Typography variant="h4" align="center" gutterBottom>
        Profil Oluştur 
      </Typography>

   

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Kullanıcı Adı"
              name="usenrame"
              value={formData.username}
              onChange={handleInputChange}
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="E-posta"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              type="email"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Telefon"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              type="tel"
              variant="outlined"
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              fullWidth
              variant="contained"
              component="label"
            >
              Profil Resmi Yükle
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFileChange}
              />
            </Button>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
            >
              Kaydet
            </Button>
          </Grid>
        </Grid>
      </form>
    </Container>
  );
};

export default CreateProfilePage;
