import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Typography
} from '@mui/material';
import { CaseType } from '../../Components/Case/Case'; // CaseType'ı import ediyoruz
import { useTheme } from '@mui/material/styles';

interface NewCaseFormProps {
  onClose: () => void;
  onSave: (newCase: CaseType) => void;
}

export const NewCaseForm: React.FC<NewCaseFormProps> = ({ onClose, onSave }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'pending' | 'closed'>('active');
  const [client, setClient] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  const handleSubmit = () => {
    const newCase: CaseType = {
      id: (Math.random() * 1000).toString(), // Geçici bir id oluşturuyoruz
      title,
      description,
      status,
      client,
      date: new Date().toISOString(), // Bugünün tarihini ekliyoruz
      category,
      priority
    };

    onSave(newCase); // Yeni davayı üst bileşene kaydetmesi için gönderiyoruz
    onClose(); // Formu kapatıyoruz
  };

  return (
    <Box sx={{ width: 400, bgcolor: 'background.paper', p: 3, borderRadius: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Create a New Case
      </Typography>

      <Stack spacing={2}>
        <TextField
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          fullWidth
          multiline
          rows={4}
        />
        <TextField
          label="Client"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          fullWidth
        />
        <TextField
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel id="status-select-label">Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'active' | 'pending' | 'closed')}
            label="Status"
            sx={{ // Styles for the Select input field itself
              '& .MuiSelect-icon': {
                color: theme.palette.text.primary, 
              },
              '& .MuiOutlinedInput-root': { // Styles the input box wrapper
                backgroundColor: theme.palette.mode === 'dark' 
                  ? '#333'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? '#444'
                    : 'transparent',
                },
                // Style for the text of the selected value inside the input box
                '& .MuiSelect-select': {
                   color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
                }
              },
              // This InputLabel styling here is likely ineffective as InputLabel is not a child.
              // Style InputLabel directly or rely on theme.
              // '& .MuiInputLabel-root': {
              //   color: theme.palette.mode === 'dark' ? 'white' : 'black',
              // },
            }}
            MenuProps={{
              sx: {
                // These styles apply to the dropdown menu and its items
                '& .MuiPaper-root': { // Optional: Style the paper containing the menu items
                    backgroundColor: theme.palette.mode === 'dark' ? '#333' : 'white',
                },
                '& .MuiMenuItem-root': {
                  // backgroundColor is now handled by MuiPaper-root or can be set per item if needed
                  // For simplicity, let MuiPaper-root handle overall BG
                  color: theme.palette.mode === 'dark' ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#444' : '#f5f5f5',
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#e0e0e0', // Adjust selected background
                    color: theme.palette.mode === 'dark' ? 'white' : 'black', // Ensure text color is appropriate
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? '#666' : '#d5d5d5',
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="closed">Closed</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="priority-select-label">Priority</InputLabel>
          <Select
            labelId="priority-select-label"
            value={priority}
            onChange={(e) => setPriority(e.target.value as 'high' | 'medium' | 'low')}
            label="Priority"
            sx={{ // Styles for the Select input field itself
              '& .MuiSelect-icon': {
                color: theme.palette.text.primary,
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme.palette.mode === 'dark' 
                  ? '#333'
                  : 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? '#444'
                    : 'transparent',
                },
                '& .MuiSelect-select': {
                   color: theme.palette.mode === 'dark' ? theme.palette.text.primary : theme.palette.text.primary,
                }
              },
              // '& .MuiInputLabel-root': {
              //   color: theme.palette.mode === 'dark' ? 'white' : 'black',
              // },
            }}
            MenuProps={{
              sx: {
                '& .MuiPaper-root': { 
                    backgroundColor: theme.palette.mode === 'dark' ? '#333' : 'white',
                },
                '& .MuiMenuItem-root': {
                  color: theme.palette.mode === 'dark' ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#444' : '#f5f5f5',
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'dark' ? '#555' : '#e0e0e0',
                    color: theme.palette.mode === 'dark' ? 'white' : 'black',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? '#666' : '#d5d5d5',
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>

        <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={onClose}
            sx={{ width: 100 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ width: 100 }}
          >
            Save
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};