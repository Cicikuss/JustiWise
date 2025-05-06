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
    useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import { Case, CaseType } from '../../Components/Case/Case';
import { useState } from 'react';

// Dummy data
const dummyCases: CaseType[] = [
    {
        id: '1',
        title: 'Contract Dispute - Johnson vs. Smith',
        description: 'Breach of contract case involving intellectual property rights and non-compete clauses.',
        status: 'active',
        client: 'Johnson Enterprises',
        date: '2024-03-15',
        category: 'Contract Law',
        priority: 'high'
    },
    {
        id: '2',
        title: 'Personal Injury Claim',
        description: 'Slip and fall accident at a commercial property resulting in severe injuries.',
        status: 'pending',
        client: 'Sarah Williams',
        date: '2024-03-10',
        category: 'Personal Injury',
        priority: 'medium'
    },
    {
        id: '3',
        title: 'Divorce Settlement',
        description: 'Complex divorce case involving multiple properties and business assets.',
        status: 'closed',
        client: 'Michael Brown',
        date: '2024-02-28',
        category: 'Family Law',
        priority: 'high'
    },
    {
        id: '4',
        title: 'Employment Discrimination',
        description: 'Case involving workplace discrimination based on gender and age.',
        status: 'active',
        client: 'Emily Davis',
        date: '2024-03-05',
        category: 'Employment Law',
        priority: 'medium'
    },
    {
        id: '5',
        title: 'Real Estate Dispute',
        description: 'Boundary dispute between neighboring properties.',
        status: 'pending',
        client: 'Thompson Properties',
        date: '2024-03-12',
        category: 'Real Estate',
        priority: 'low'
    }
];

export const MyCases = () => {
    const theme = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');

    const filteredCases = dummyCases.filter(caseData => {
        const matchesSearch = caseData.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            caseData.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            caseData.client.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = statusFilter === 'all' || caseData.status === statusFilter;
        const matchesPriority = priorityFilter === 'all' || caseData.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

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
                            bgcolor: theme.palette.primary.dark,
                        }
                    }}
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
                        backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(255, 255, 255, 0.05)' 
                            : 'rgba(0, 0, 0, 0.05)',
                        '&:hover': {
                            backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.08)' 
                                : 'rgba(0, 0, 0, 0.08)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: theme.palette.mode === 'dark' 
                                ? 'rgba(255, 255, 255, 0.12)' 
                                : 'rgba(0, 0, 0, 0.12)',
                        },
                        '& .MuiInputBase-input': {
                            color: theme.palette.text.primary,
                        },
                        '& .MuiInputLabel-root': {
                            color: theme.palette.text.secondary,
                        },
                        '& .MuiSelect-icon': {
                            color: theme.palette.text.secondary,
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
                                <SearchIcon sx={{ 
                                    color: theme.palette.text.secondary
                                }} />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ 
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                        }
                    }}
                />
                
                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: theme.palette.text.secondary }}>Status</InputLabel>
                    <Select
                        value={statusFilter}
                        label="Status"
                        onChange={(e) => setStatusFilter(e.target.value)}
                        startAdornment={
                            <InputAdornment position="start">
                                <FilterListIcon sx={{ 
                                    color: theme.palette.text.secondary
                                }} />
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
                                            bgcolor: theme.palette.mode === 'dark' 
                                                ? 'rgba(255, 255, 255, 0.1)' 
                                                : 'rgba(0, 0, 0, 0.05)'
                                        }
                                    }
                                }
                            }
                        }}
                    >
                        <MenuItem value="all">
                            <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.text.secondary,
                                mr: 1
                            }} />
                            All Statuses
                        </MenuItem>
                        <MenuItem value="active">
                            <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.success.main,
                                mr: 1
                            }} />
                            Active
                        </MenuItem>
                        <MenuItem value="pending">
                            <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.warning.main,
                                mr: 1
                            }} />
                            Pending
                        </MenuItem>
                        <MenuItem value="closed">
                            <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.error.main,
                                mr: 1
                            }} />
                            Closed
                        </MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: theme.palette.text.secondary }}>Priority</InputLabel>
                    <Select
                        value={priorityFilter}
                        label="Priority"
                        onChange={(e) => setPriorityFilter(e.target.value)}
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
                                            bgcolor: theme.palette.mode === 'dark' 
                                                ? 'rgba(255, 255, 255, 0.1)' 
                                                : 'rgba(0, 0, 0, 0.05)'
                                        }
                                    }
                                }
                            }
                        }}
                    >
                        <MenuItem value="all">
                            <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.text.secondary,
                                mr: 1
                            }} />
                            All Priorities
                        </MenuItem>
                        <MenuItem value="high">
                            <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.error.main,
                                mr: 1
                            }} />
                            High
                        </MenuItem>
                        <MenuItem value="medium">
                            <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.warning.main,
                                mr: 1
                            }} />
                            Medium
                        </MenuItem>
                        <MenuItem value="low">
                            <Box sx={{ 
                                width: 8, 
                                height: 8, 
                                borderRadius: '50%', 
                                bgcolor: theme.palette.success.main,
                                mr: 1
                            }} />
                            Low
                        </MenuItem>
                    </Select>
                </FormControl>
            </Stack>

            <Grid container spacing={3}>
                {filteredCases.map((caseData) => (
                    <Grid item xs={12} sm={6} md={4} key={caseData.id}>
                        <Case caseData={caseData} />
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}; 