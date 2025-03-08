import { useState, useEffect } from "react";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  IconButton, 
  useTheme, 
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip
} from "@mui/material";
import { 
  AccountCircle,
  Notifications,
  MoreVert,
  Person
} from "@mui/icons-material";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface UserProfile {
  profile_picture?: string;
  first_name: string;
  last_name: string;
}

const Navbar = ({ sidebarWidth = 240, collapsed = false }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>("User");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<null | HTMLElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<{ role: string; name?: string }>(token);
        setUserRole(decoded.role);
        if (decoded.name) {
          setUserName(decoded.name);
        }

        // Fetch profile data if user is a student
        if (decoded.role === 'student') {
          fetchProfile(token);
        }
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const fetchProfile = async (token: string) => {
    try {
      const response = await axios.get(
        'https://lms-backend-cntm.onrender.com/api/student/profile',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMobileMoreAnchorEl(null);
  };

  // Calculate width based on sidebar state
  const actualSidebarWidth = collapsed ? 65 : sidebarWidth;
  
  const menuId = 'primary-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      id={menuId}
      keepMounted
      open={isMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 2,
        sx: {
          mt: 1.5,
          width: 200,
        }
      }}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>Account Settings</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      id={mobileMenuId}
      keepMounted
      open={isMobileMenuOpen}
      onClose={handleMenuClose}
      PaperProps={{
        elevation: 2,
        sx: {
          mt: 1.5,
        }
      }}
    >
      <MenuItem>
        <IconButton size="large" color="inherit">
          <Notifications />
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-controls={menuId}
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  const handleProfileClick = () => {
    if (userRole === 'student') {
      navigate('/student/profile');
    }
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        width: { xs: '100%', md: `calc(100% - ${actualSidebarWidth}px)` }, 
        ml: { xs: 0, md: `${actualSidebarWidth}px` },
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: '#1a2c3b',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: theme.zIndex.drawer - 1
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #64b5f6, #4fc3f7)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            display: { xs: 'block', sm: 'block' }
          }}
        >
          Joe Expo Cohort Panel
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center' }}>
            <Tooltip title={userRole === 'student' ? "Edit Profile" : "Admin"}>
              <Box 
                onClick={handleProfileClick}
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: userRole === 'student' ? 'pointer' : 'default',
                  gap: 1,
                  '&:hover': {
                    opacity: userRole === 'student' ? 0.8 : 1
                  }
                }}
              >
                <Avatar
                  src={userRole === 'student' ? profile?.profile_picture : undefined}
                  sx={{
                    bgcolor: userRole === 'admin' ? '#4fc3f7' : '#81c784',
                    width: 40,
                    height: 40,
                    cursor: userRole === 'student' ? 'pointer' : 'default'
                  }}
                >
                  {userRole === 'admin' ? 'A' : userName?.charAt(0) || 'U'}
                </Avatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="subtitle2" sx={{ color: '#fff' }}>
                    {userName}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: userRole === 'admin' ? '#4fc3f7' : '#81c784',
                      fontWeight: 'bold'
                    }}
                  >
                    {userRole}
                  </Typography>
                </Box>
              </Box>
            </Tooltip>
          </Box>
          
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
      {renderMobileMenu}
      {renderMenu}
    </AppBar>
  );
};

export default Navbar;