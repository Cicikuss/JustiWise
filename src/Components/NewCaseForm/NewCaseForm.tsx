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
import { useTheme } from '@mui/material/styles';
import { CaseType, newCase } from '../../Models/Case';

interface NewCaseFormProps {
  onClose: () => void;
  onSave: (newCase: newCase) => void;
}

export const NewCaseForm: React.FC<NewCaseFormProps> = ({ onClose, onSave }) => {
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'pending' | 'closed'>('active');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [attachedFile, setAttachedFile] = useState<File | undefined>(undefined);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (allowedTypes.includes(file.type)) {
        setAttachedFile(file);
      } else {
        alert('Only PDF or DOCX files are allowed.');
      }
    }
  };

  const handleSubmit = () => {
    const newCase: newCase = {
      title,
      description,
      status,
      category,
      priority,
      file: attachedFile 
    };

    onSave(newCase);
    onClose();
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
            sx={{
              '& .MuiSelect-icon': {
                color: theme.palette.text.primary
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor:
                  theme.palette.mode === 'dark' ? '#333' : 'transparent',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? '#444' : 'transparent'
                },
                '& .MuiSelect-select': {
                  color: theme.palette.text.primary
                }
              }
            }}
            MenuProps={{
              sx: {
                '& .MuiPaper-root': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? '#333' : 'white'
                },
                '& .MuiMenuItem-root': {
                  color: theme.palette.mode === 'dark' ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark' ? '#444' : '#f5f5f5'
                  },
                  '&.Mui-selected': {
                    backgroundColor:
                      theme.palette.mode === 'dark' ? '#555' : '#e0e0e0',
                    color: theme.palette.mode === 'dark' ? 'white' : 'black',
                    '&:hover': {
                      backgroundColor:
                        theme.palette.mode === 'dark' ? '#666' : '#d5d5d5'
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
            sx={{
              '& .MuiSelect-icon': {
                color: theme.palette.text.primary
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor:
                  theme.palette.mode === 'dark' ? '#333' : 'transparent',
                '&:hover': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? '#444' : 'transparent'
                },
                '& .MuiSelect-select': {
                  color: theme.palette.text.primary
                }
              }
            }}
            MenuProps={{
              sx: {
                '& .MuiPaper-root': {
                  backgroundColor:
                    theme.palette.mode === 'dark' ? '#333' : 'white'
                },
                '& .MuiMenuItem-root': {
                  color: theme.palette.mode === 'dark' ? 'white' : 'black',
                  '&:hover': {
                    backgroundColor:
                      theme.palette.mode === 'dark' ? '#444' : '#f5f5f5'
                  },
                  '&.Mui-selected': {
                    backgroundColor:
                      theme.palette.mode === 'dark' ? '#555' : '#e0e0e0',
                    color: theme.palette.mode === 'dark' ? 'white' : 'black',
                    '&:hover': {
                      backgroundColor:
                        theme.palette.mode === 'dark' ? '#666' : '#d5d5d5'
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

        <Box>
          <Typography variant="subtitle1">Upload Document (PDF or DOCX)</Typography>
          <Button variant="outlined" component="label">
            {attachedFile ? attachedFile.name : 'Choose File'}
            <input
              type="file"
              hidden
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
            />
          </Button>
        </Box>

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
export default NewCaseForm;