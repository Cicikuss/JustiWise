import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    Paper,
    Box,
    CircularProgress,
    Alert,
    IconButton,
    Divider,
    Button,
    useTheme,
    Chip
} from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'; // For "mark as read"
import MarkEmailUnreadIcon from '@mui/icons-material/MarkEmailUnread'; // For "mark as unread"
import VisibilityIcon from '@mui/icons-material/Visibility'; // For "View Case"

import { Notification } from '../../Models/Notification';
import { getNotifications } from '../../service/supabaseClient'; // Assuming this fetches ALL notifications
// You'll likely need a function to update notification status in your supabaseClient
// import { updateNotificationReadStatus } from '../../service/supabaseClient';

export const NotificationsPage = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const fetchedNotifications = await getNotifications();
            // Sort notifications, e.g., newest first
            fetchedNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setNotifications(fetchedNotifications);
        } catch (err) {
            console.error("Error fetching notifications:", err);
            setError("Failed to load notifications. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        // Optional: Mark notification as read when clicked, if not already read
        // if (!notification.is_read) {
        //     markAsRead(notification.id);
        // }
        if (notification.case_id) {
            navigate(`/case/${notification.case_id}`);
        }
    };

    const toggleReadStatus = async (notificationId: string, currentStatus: boolean) => {
        // Placeholder for actual API call
        console.log(`Toggling read status for ${notificationId} to ${!currentStatus}`);
        // try {
        //   await updateNotificationReadStatus(notificationId, !currentStatus);
        //   setNotifications(prevNotifications =>
        //     prevNotifications.map(n =>
        //       n.id === notificationId ? { ...n, is_read: !currentStatus } : n
        //     )
        //   );
        // } catch (apiError) {
        //   console.error("Failed to update notification status:", apiError);
        //   // Optionally show an error to the user (e.g., using a Snackbar)
        // }

        // For UI demonstration purposes, toggle locally:
        setNotifications(prevNotifications =>
            prevNotifications.map(n =>
                n.id === notificationId ? { ...n, is_read: !currentStatus } : n
            )
        );
    };

    const handleMarkAllAsRead = async () => {
        // Placeholder for actual API call to mark all as read
        console.log("Marking all notifications as read");
        // try {
        //   // You'd need a backend endpoint for this or iterate and call updateNotificationReadStatus
        //   // await markAllNotificationsAsRead();
        //   setNotifications(prevNotifications =>
        //     prevNotifications.map(n => ({ ...n, is_read: true }))
        //   );
        // } catch (apiError) {
        //   console.error("Failed to mark all notifications as read:", apiError);
        // }

        // For UI demonstration:
        setNotifications(prevNotifications =>
            prevNotifications.map(n => ({ ...n, is_read: true }))
        );
    };


    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md" sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        All Notifications
                    </Typography>
                    {notifications.some(n => !n.is_read) && (
                         <Button
                            variant="outlined"
                            onClick={handleMarkAllAsRead}
                            startIcon={<MarkEmailReadIcon />}
                        >
                            Mark All as Read
                        </Button>
                    )}
                </Box>

                {notifications.length === 0 ? (
                    <Typography variant="body1" color="text.secondary" textAlign="center">
                        You have no notifications.
                    </Typography>
                ) : (
                    <List disablePadding>
                        {notifications.map((notification, index) => (
                            <Box key={notification.id}>
                                <ListItem
                                    sx={{
                                        backgroundColor: notification.is_read
                                            ? theme.palette.background.paper // Or a slightly different shade for read items
                                            : theme.palette.mode === 'dark' ? theme.palette.action.hover : theme.palette.grey[100],
                                        mb: 1,
                                        borderRadius: 1,
                                        transition: 'background-color 0.3s',
                                        '&:hover': {
                                            backgroundColor: theme.palette.action.selected,
                                        },
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body1"
                                                sx={{ fontWeight: notification.is_read ? 'normal' : 'bold' }}
                                            >
                                                {notification.message}
                                            </Typography>
                                        }
                                        secondary={
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(notification.timestamp).toLocaleString()}
                                                {notification.case_id && (
                                                    <Chip
                                                        label="Case Related"
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                        sx={{ ml: 1, mt: 0.5 }}
                                                    />
                                                )}
                                            </Typography>
                                        }
                                        onClick={() => handleNotificationClick(notification)}
                                        sx={{ cursor: notification.case_id ? 'pointer' : 'default', flexGrow: 1, pr: 1 }}
                                    />
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', ml: 1, mt: 1 }}>
                                        {notification.case_id && (
                                            <IconButton
                                                size="small"
                                                onClick={() => handleNotificationClick(notification)}
                                                title="View Case"
                                                sx={{ mb: 0.5}}
                                            >
                                                <VisibilityIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            size="small"
                                            onClick={() => toggleReadStatus(notification.id, notification.is_read)}
                                            title={notification.is_read ? "Mark as Unread" : "Mark as Read"}
                                        >
                                            {notification.is_read ? <MarkEmailUnreadIcon fontSize="small" /> : <MarkEmailReadIcon fontSize="small" />}
                                        </IconButton>
                                    </Box>
                                </ListItem>
                                {index < notifications.length - 1 && <Divider component="li" sx={{ my: 0.5, mx: -2 }} />}
                            </Box>
                        ))}
                    </List>
                )}
            </Paper>
        </Container>
    );
};