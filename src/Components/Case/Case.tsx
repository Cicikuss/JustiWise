import {
    Paper,
    Typography,
    Box,
    Chip,
    Stack,
    IconButton,
    useTheme,
    Tooltip,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { CaseType } from '../../Models/Case';
import { getUserById } from '../../service/supabaseClient';
import { useEffect, useState } from 'react';

type CaseProps = {
    caseData: CaseType;
    onEdit: (caseData: CaseType) => void;
    onDelete: (caseId: string) => void;
};

const getStatusColor = (status: string, theme: any) => {
    switch (status) {
        case 'active':
            return theme.palette.success.main;
        case 'pending':
            return theme.palette.warning.main;
        case 'closed':
            return theme.palette.error.main;
        default:
            return theme.palette.primary.main;
    }
};

const getPriorityColor = (priority: string, theme: any) => {
    switch (priority) {
        case 'high':
            return theme.palette.error.main;
        case 'medium':
            return theme.palette.warning.main;
        case 'low':
            return theme.palette.success.main;
        default:
            return theme.palette.primary.main;
    }
};

export const Case = ({ caseData, onEdit, onDelete }: CaseProps) => {
    const theme = useTheme();
   const [clientName, setClientName] = useState<string>('');
   const [lawyerName, setLawyerName] = useState<string>('');

   useEffect(() => {
        const fetchClientName = async () => {
            const client = await getUserById(caseData.client);
            setClientName(client?.username || 'Unknown');
        };

        const fetchLawyerName = async () => {
            if (!caseData.lawyer) {
                setLawyerName('Unknown');
                return;
            }
            // Fetch lawyer name only if it exists
            const lawyer = await getUserById(caseData.lawyer);
            setLawyerName(lawyer?.username || 'Unknown');
        };

        fetchClientName();
        fetchLawyerName();
    }, []);
    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[4],
                },
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 2,
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {caseData.title}
                </Typography>
                <Stack direction="row" spacing={1}>
                    <Tooltip title="Edit Case">
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => onEdit(caseData)}
                        >
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Case">
                        <IconButton
                            size="small"
                            color="error"
                            onClick={() => onDelete(caseData.id)}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Stack>
            </Box>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                }}
            >
                {caseData.description}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                    label={caseData.status.toUpperCase()}
                    size="small"
                    sx={{
                        bgcolor: getStatusColor(caseData.status, theme),
                        color: 'white',
                        fontWeight: 500,
                    }}
                />
                <Chip
                    label={caseData.priority.toUpperCase()}
                    size="small"
                    sx={{
                        bgcolor: getPriorityColor(caseData.priority, theme),
                        color: 'white',
                        fontWeight: 500,
                    }}
                />
                <Chip
                    label={caseData.category}
                    size="small"
                    variant="outlined"
                />
            </Stack>

            <Stack direction="row" spacing={2} sx={{ color: 'text.secondary' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">{clientName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon fontSize="small" />
                    <Typography variant="body2">{lawyerName}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon fontSize="small" />
                    <Typography variant="body2">{new Date(caseData.created_at).toLocaleString("tr-TR",{
                        dateStyle: "medium",
                        timeStyle: "short",     
                    })}</Typography>
                </Box>
            </Stack>
        </Paper>
    );
};
export default Case;