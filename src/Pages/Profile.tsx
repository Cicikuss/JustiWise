import React from 'react';
import { Box, Typography, Paper, Avatar, Grid } from '@mui/material';

const Profile: React.FC = () => {
  // Örnek kullanıcı verileri
  const user = {
    name: 'Ahmet Engin',
    email: 'ahmet.engin@example.com',
    role: 'Kullanıcı',
    joinDate: '01 Mart 2024',
    avatar: 'https://mui.com/static/images/avatar/1.jpg'
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        Profil
      </Typography>
      
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Avatar
              src={user.avatar}
              sx={{ width: 120, height: 120 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="h5" gutterBottom>
              {user.name}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              <strong>E-posta:</strong> {user.email}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              <strong>Rol:</strong> {user.role}
            </Typography>
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="body1" color="text.secondary">
              <strong>Katılma Tarihi:</strong> {user.joinDate}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile; 