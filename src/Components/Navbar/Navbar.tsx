import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Stack, 
    Button, 
    Box, 
    useTheme,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Avatar,
    Badge,
    TextField,
    InputAdornment
} from "@mui/material"
import BalanceIcon from '@mui/icons-material/Balance';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PersonIcon from '@mui/icons-material/Person';
import FolderIcon from '@mui/icons-material/Folder';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useThemeContext } from "../../Context/ThemeContext";
import { useSearch } from '../../Context/SearchContext';
import { useAuth } from '../../Context/AuthContext';

export const Navbar = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { toggleTheme } = useThemeContext();
    const { searchQuery, setSearchQuery } = useSearch();
    const { user, logout } = useAuth();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationsAnchor, setNotificationsAnchor] = useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
        setNotificationsAnchor(event.currentTarget);
    };

    const handleNotificationsClose = () => {
        setNotificationsAnchor(null);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const query = event.target.value;
        setSearchQuery(query);
        if (query.trim()) {
            navigate('/search-results');
        }
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    return (
        <AppBar 
            position="sticky" 
            elevation={0} 
            sx={{ 
                backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(18, 18, 18, 0.9)' 
                    : 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                borderBottom: `1px solid ${theme.palette.divider}`,
                transition: 'all 0.3s ease-in-out'
            }}
        >
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ 
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: 70
                }}>
                    {/* Logo Section */}
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            cursor: 'pointer',
                            '&:hover': {
                                opacity: 0.8
                            }
                        }} 
                        onClick={() => navigate('/')}
                    >
                        <BalanceIcon sx={{ 
                            fontSize: 32, 
                            mr: 1,
                            color: theme.palette.primary.main
                        }} />
                        <Typography 
                            variant="h5" 
                            component="div" 
                            sx={{ 
                                fontWeight: 700,
                                letterSpacing: '0.5px',
                                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: { xs: 'none', sm: 'block' }
                            }}
                        >
                            JustiWise
                        </Typography>
                    </Box>

                    {/* Search Bar */}
                    <Box sx={{ 
                        display: { xs: 'none', md: 'flex' },
                        flex: 1,
                        maxWidth: 500,
                        mx: 4
                    }}>
                        <TextField
                            fullWidth
                            placeholder="Search across the site..."
                            value={searchQuery}
                            onChange={handleSearchChange}
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
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.05)' 
                                        : 'rgba(0, 0, 0, 0.05)',
                                    borderRadius: 2,
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
                                }
                            }}
                        />
                    </Box>

                    {/* Right Section */}
                    <Stack direction="row" spacing={1} alignItems="center">
                        <IconButton 
                            onClick={toggleTheme}
                            sx={{
                                color: theme.palette.text.primary,
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
                        </IconButton>

                        <IconButton 
                            onClick={handleNotificationsOpen}
                            sx={{
                                color: theme.palette.text.primary,
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>

                        <Button
                            onClick={handleMenuOpen}
                            startIcon={<Avatar sx={{ width: 28, height: 28 }}>{user?.name?.[0] || 'A'}</Avatar>}
                            sx={{
                                textTransform: 'none',
                                color: theme.palette.text.primary,
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            <Typography variant="body2" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                                {user?.name || 'User'}
                            </Typography>
                        </Button>
                    </Stack>

                    {/* Profile Menu */}
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'white',
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'white',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem 
                            onClick={() => {
                                handleMenuClose();
                                navigate('/profile');
                            }}
                            sx={{
                                color: theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            <PersonIcon sx={{ mr: 1 }} />
                            Profile
                        </MenuItem>
                        <MenuItem 
                            onClick={() => {
                                handleMenuClose();
                                navigate('/my-cases');
                            }}
                            sx={{
                                color: theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            <FolderIcon sx={{ mr: 1 }} />
                            My Cases
                        </MenuItem>
                        <MenuItem 
                            onClick={handleMenuClose}
                            sx={{
                                color: theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            <SettingsIcon sx={{ mr: 1 }} />
                            Settings
                        </MenuItem>
                        <MenuItem 
                            onClick={handleLogout}
                            sx={{
                                color: theme.palette.error.main,
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            <LogoutIcon sx={{ mr: 1 }} />
                            Logout
                        </MenuItem>
                    </Menu>

                    {/* Notifications Menu */}
                    <Menu
                        anchorEl={notificationsAnchor}
                        open={Boolean(notificationsAnchor)}
                        onClose={handleNotificationsClose}
                        PaperProps={{
                            elevation: 0,
                            sx: {
                                overflow: 'visible',
                                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                                mt: 1.5,
                                bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'white',
                                '&:before': {
                                    content: '""',
                                    display: 'block',
                                    position: 'absolute',
                                    top: 0,
                                    right: 14,
                                    width: 10,
                                    height: 10,
                                    bgcolor: theme.palette.mode === 'dark' ? '#1e1e1e' : 'white',
                                    transform: 'translateY(-50%) rotate(45deg)',
                                    zIndex: 0,
                                },
                            },
                        }}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    >
                        <MenuItem 
                            onClick={handleNotificationsClose}
                            sx={{
                                color: theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" sx={{ color: 'inherit' }}>New case assigned</Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>2 hours ago</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem 
                            onClick={handleNotificationsClose}
                            sx={{
                                color: theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" sx={{ color: 'inherit' }}>Meeting reminder</Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>Yesterday</Typography>
                            </Box>
                        </MenuItem>
                        <MenuItem 
                            onClick={handleNotificationsClose}
                            sx={{
                                color: theme.palette.mode === 'dark' ? '#ffffff' : 'rgba(0, 0, 0, 0.87)',
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark' 
                                        ? 'rgba(255, 255, 255, 0.1)' 
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            }}
                        >
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                <Typography variant="body2" sx={{ color: 'inherit' }}>Document approved</Typography>
                                <Typography variant="caption" sx={{ color: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)' }}>2 days ago</Typography>
                            </Box>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </Container>
        </AppBar>
    )
}