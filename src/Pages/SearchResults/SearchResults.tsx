import { Box, Typography, useTheme, Paper, Stack } from '@mui/material';
import { useSearch } from '../../Context/SearchContext';
import { Case, CaseType } from '../../Components/Case/Case';
import { Grid } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

type ChatMessageType = {
    id: string;
    content: string;
    timestamp: string;
    sender: string;
};

export const SearchResults = () => {
    const theme = useTheme();
    const { searchQuery } = useSearch();

    // Dummy data for search results
    const searchResults = {
        cases: [
            {
                id: '1',
                title: 'Contract Dispute - Johnson vs. Smith',
                description: 'Breach of contract case involving intellectual property rights and non-compete clauses.',
                status: 'active' as const,
                client: 'Johnson Enterprises',
                date: '2024-03-15',
                category: 'Contract Law',
                priority: 'high' as const
            },
            {
                id: '2',
                title: 'Personal Injury Claim',
                description: 'Slip and fall accident at a commercial property.',
                status: 'pending' as const,
                client: 'Sarah Williams',
                date: '2024-03-10',
                category: 'Personal Injury',
                priority: 'medium' as const
            }
        ],
        chatMessages: [
            {
                id: '1',
                content: 'I need help with a contract dispute case. The other party is not fulfilling their obligations.',
                timestamp: '2024-03-15 14:30',
                sender: 'Johnson Enterprises'
            },
            {
                id: '2',
                content: 'Regarding the personal injury claim, we should discuss the settlement offer.',
                timestamp: '2024-03-14 10:15',
                sender: 'Sarah Williams'
            }
        ]
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 4 }}>
                Search Results for "{searchQuery}"
            </Typography>

            {searchQuery.trim() ? (
                <>
                    {/* Cases Section */}
                    {searchResults.cases.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                                Cases
                            </Typography>
                            <Grid container spacing={3}>
                                {searchResults.cases.map((caseData) => (
                                    <Grid item xs={12} sm={6} md={4} key={caseData.id}>
                                        <Case caseData={caseData} />
                                    </Grid>
                                ))}
                            </Grid>
                        </Box>
                    )}

                    {/* Chat Messages Section */}
                    {searchResults.chatMessages.length > 0 && (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                                Chat Messages
                            </Typography>
                            <Stack spacing={2}>
                                {searchResults.chatMessages.map((message) => (
                                    <Paper
                                        key={message.id}
                                        elevation={1}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            bgcolor: theme.palette.mode === 'dark' 
                                                ? 'rgba(255, 255, 255, 0.05)' 
                                                : 'rgba(0, 0, 0, 0.02)',
                                            '&:hover': {
                                                bgcolor: theme.palette.mode === 'dark' 
                                                    ? 'rgba(255, 255, 255, 0.08)' 
                                                    : 'rgba(0, 0, 0, 0.04)',
                                            }
                                        }}
                                    >
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                                            <ChatBubbleOutlineIcon sx={{ 
                                                color: theme.palette.primary.main,
                                                fontSize: 20
                                            }} />
                                            <Typography variant="subtitle2" sx={{ color: theme.palette.text.secondary }}>
                                                {message.sender}
                                            </Typography>
                                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, ml: 'auto' }}>
                                                {message.timestamp}
                                            </Typography>
                                        </Stack>
                                        <Typography variant="body2">
                                            {message.content}
                                        </Typography>
                                    </Paper>
                                ))}
                            </Stack>
                        </Box>
                    )}
                </>
            ) : (
                <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>
                    Please enter a search term to see results
                </Typography>
            )}
        </Box>
    );
}; 