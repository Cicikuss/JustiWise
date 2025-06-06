import {
  Box,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Button,
  useTheme,
  Modal,
  Fade,
  Backdrop
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from 'react';
import { NewCaseForm } from '../../Components/NewCaseForm/NewCaseForm';
import { Case } from '../../Components/Case/Case';
import { CaseType, CaseTypeWithURL, newCase } from '../../Models/Case';
import { addNewCase, deleteCase, getCasesClient, getCasesLawyer } from '../../service/supabaseClient';



type StatusFilter = 'all' | 'active' | 'pending' | 'closed';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export const MyCases = () => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [openModal, setOpenModal] = useState(false);
  const [cases, setCases] = useState<CaseTypeWithURL[]>([]);

  const filteredCases = cases.filter((caseData) => {
    const matchesSearch =
      caseData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseData.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caseData.client.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || caseData.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || caseData.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);
  useEffect(() => {
    const fetchCases = async () => {
      const user = JSON.parse(localStorage.getItem('user')!);
      if(user.role === 'lawyer'){
       const caseS =await getCasesLawyer();
        setCases(caseS);
      }
      else{
        const caseS=await getCasesClient();
        setCases(caseS);
      }
      
    }
    fetchCases();
  }
  , []);
  const handleSaveNewCase = async (newCase: newCase) => {
    await addNewCase(newCase);

    handleCloseModal();
  }

  const handleDeleteCase = async (caseId: string) => {
    await deleteCase(caseId);
    setCases((prevCases) => prevCases.filter((caseData) => caseData.id !== caseId));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          My Cases
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
            bgcolor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              bgcolor: theme.palette.primary.dark
            }
          }}
          onClick={handleOpenModal} 
        >
          New Case
        </Button>
      </Box>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          mb: 4,
          '& .MuiOutlinedInput-root': {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            '&:hover': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
            },
            '&.Mui-focused': {
              backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
            },
            '& .MuiInputBase-input': {
              color: theme.palette.text.primary
            },
            '& .MuiInputLabel-root': {
              color: theme.palette.text.secondary
            },
            '& .MuiSelect-icon': {
              color: theme.palette.text.secondary
            }
          }
        }}
      >
        <TextField
          fullWidth
          placeholder="Search cases..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            )
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2
            }
          }}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: theme.palette.text.secondary }}>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            startAdornment={
              <InputAdornment position="start">
                <FilterListIcon sx={{ color: theme.palette.text.secondary }} />
              </InputAdornment>
            }
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: theme.palette.text.primary
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.9)' : 'white',
                  '& .MuiMenuItem-root': {
                    color: theme.palette.text.primary,
                    '&:hover': {
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.05)'
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="all">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.text.secondary,
                  mr: 1
                }}
              />
              All Statuses
            </MenuItem>
            <MenuItem value="active">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main,
                  mr: 1
                }}
              />
              Active
            </MenuItem>
            <MenuItem value="pending">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.warning.main,
                  mr: 1
                }}
              />
              Pending
            </MenuItem>
            <MenuItem value="closed">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.error.main,
                  mr: 1
                }}
              />
              Closed
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: theme.palette.text.secondary }}>Priority</InputLabel>
          <Select
            value={priorityFilter}
            label="Priority"
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            sx={{
              '& .MuiSelect-select': {
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: theme.palette.text.primary
              }
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(18, 18, 18, 0.9)' : 'white',
                  '& .MuiMenuItem-root': {
                    color: theme.palette.text.primary,
                    '&:hover': {
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.1)'
                          : 'rgba(0, 0, 0, 0.05)'
                    }
                  }
                }
              }
            }}
          >
            <MenuItem value="all">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.text.secondary,
                  mr: 1
                }}
              />
              All Priorities
            </MenuItem>
            <MenuItem value="high">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.error.main,
                  mr: 1
                }}
              />
              High
            </MenuItem>
            <MenuItem value="medium">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.warning.main,
                  mr: 1
                }}
              />
              Medium
            </MenuItem>
            <MenuItem value="low">
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: theme.palette.success.main,
                  mr: 1
                }}
              />
              Low
            </MenuItem>
          </Select>
        </FormControl>
      </Stack>

      <Grid container spacing={3}>
        {filteredCases.map((caseData) => (
          <Grid item xs={12} sm={6} md={4} key={caseData.id}>
            <Case caseData={caseData} onEdit={function (caseData: CaseType): void {
              throw new Error('Function not implemented.');
            } } onDelete={async function (caseId: string): Promise<void> {
              await handleDeleteCase(caseId);
            } } />
          </Grid>
        ))}
      </Grid>

      {/* Modal for New Case */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={openModal}>
          <Box sx={{ 
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2
          }}>
            {/* New Case Form can go here */}
            <Typography variant="h6"><NewCaseForm onClose={handleCloseModal}
                        onSave={handleSaveNewCase }/></Typography>
            {/* Add form elements here */}
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
};
