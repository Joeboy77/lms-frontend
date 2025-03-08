import { useState, useEffect } from "react";
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  IconButton, 
  Divider, 
  Box,
  Typography,
  useMediaQuery,
  useTheme,
  AppBar,
  Toolbar,
  Container,
  Badge,
  Tooltip
} from "@mui/material";
import { 
  Dashboard, 
  Assignment, 
  Quiz, 
  Menu as MenuIcon, 
  Logout,
  ChevronLeft,
  ChevronRight,
  Notifications,
  AccountCircle
} from "@mui/icons-material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Define the sidebar width values
const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 68;

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Retrieve token from localStorage
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<{ role: string }>(token);
        setUserRole(decoded.role); // Extract user role from token
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  // Close sidebar drawer when route changes on mobile
  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Admin Sidebar Items
  const adminMenuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/admin/dashboard" },
    { text: "Create Quiz", icon: <Quiz />, path: "/admin/create-quiz" },
    { text: "Upload Assignment", icon: <Assignment />, path: "/admin/upload-assignment" },
  ];

  // Student Sidebar Items
  const studentMenuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/student/dashboard" },
    { text: "Test & Quizzes", icon: <Quiz />, path: "/student/test-quizzes" },
    { text: "View & Submit Assignments", icon: <Assignment />, path: "/student/assignments" },
  ];

  // Determine which menu to display based on user role
  const menuItems = userRole === "admin" ? adminMenuItems : userRole === "student" ? studentMenuItems : [];

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const sidebarWidth = collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarContent = (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'linear-gradient(to bottom, #1a2c3b, #0c1824)',
        color: '#fff',
        overflow: 'hidden'
      }}
    >
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          p: 2,
          justifyContent: collapsed ? 'center' : 'space-between'
        }}
      >
        {!collapsed && (
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 'bold',
              color: '#fff',
              fontSize: '1.1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {userRole === 'admin' ? 'Admin Panel' : 'Student Portal'}
          </Typography>
        )}
        <IconButton 
          onClick={toggleCollapse} 
          sx={{ 
            color: '#fff',
            display: { xs: 'none', md: 'flex' }
          }}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </Box>
      
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)' }} />
      
      <List sx={{ pt: 1, overflowY: 'auto', flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip 
                title={collapsed ? item.text : ""}
                placement="right"
                arrow
                disableHoverListener={!collapsed}
              >
                <Box
                  component={NavLink}
                  to={item.path}
                  sx={{
                    display: "flex",
                    width: "100%",
                    padding: collapsed ? "12px 0" : "10px 16px",
                    textDecoration: "none",
                    color: "#fff",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    borderLeft: isActive ? "4px solid #4fc3f7" : "4px solid transparent",
                    backgroundColor: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                    transition: "all 0.2s ease-in-out",
                    borderRadius: "0 4px 4px 0",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.05)",
                    }
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: isActive ? "#4fc3f7" : "rgba(255,255,255,0.7)",
                    minWidth: collapsed ? 0 : 40,
                    marginRight: collapsed ? 0 : 2,
                    display: 'flex',
                    justifyContent: 'center'
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  {!collapsed && <ListItemText 
                    primary={item.text} 
                    primaryTypographyProps={{ 
                      fontSize: '0.95rem',
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? "#fff" : "rgba(255,255,255,0.85)",
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }} 
                  />}
                </Box>
              </Tooltip>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mt: 'auto' }} />
      
      {/* Logout button at bottom */}
      <Box sx={{ mb: 1, mt: 1 }}>
        <Tooltip 
          title={collapsed ? "Logout" : ""}
          placement="right"
          arrow
          disableHoverListener={!collapsed}
        >
          <ListItem
            component="div"
            sx={{
              padding: collapsed ? "12px 0" : "10px 16px",
              justifyContent: collapsed ? "center" : "flex-start",
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
              cursor: 'pointer',
              borderRadius: "0 4px 4px 0",
            }}
            onClick={handleLogout}
          >
            <ListItemIcon sx={{ 
              color: '#ff5252', 
              minWidth: collapsed ? 0 : 40,
              marginRight: collapsed ? 0 : 2,
              display: 'flex',
              justifyContent: 'center'
            }}>
              <Logout />
            </ListItemIcon>
            {!collapsed && <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ 
                color: '#ff5252',
                fontSize: '0.95rem',
                fontWeight: 500
              }} 
            />}
          </ListItem>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Fixed Top AppBar - Always visible on all devices */}
      <AppBar 
        position="fixed" 
        elevation={1}
        sx={{ 
          zIndex: theme.zIndex.drawer + 2,
          backgroundColor: '#1a2c3b',
          boxShadow: '0 1px 8px rgba(0,0,0,0.15)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Menu button for mobile */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ 
                mr: 2,
                display: { xs: 'block', md: 'none' },
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography 
              variant="h6" 
              noWrap
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.25rem' }
              }}
            >
              Joe Expo Cohort Panel
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Notification icon */}
            <Tooltip title="Notifications">
              <IconButton color="inherit" size="small">
                <Badge badgeContent={3} color="error">
                  <Notifications />
                </Badge>
              </IconButton>
            </Tooltip>
            
            {/* User icon and role badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {userRole && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    backgroundColor: userRole === 'admin' ? '#4fc3f7' : '#81c784', 
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 4,
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    fontSize: '0.7rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {userRole}
                </Typography>
              )}
              <Tooltip title="Account">
                <IconButton color="inherit" size="small">
                  <AccountCircle />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { 
            width: EXPANDED_WIDTH,
            boxSizing: 'border-box',
            zIndex: theme.zIndex.drawer + 1,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
      
      {/* Desktop Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            zIndex: theme.zIndex.drawer,
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        <Toolbar /> {/* Space for the AppBar */}
        {sidebarContent}
      </Drawer>
      
      {/* Main content wrapper */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${sidebarWidth}px)` },
          ml: { xs: 0, md: `${sidebarWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Toolbar /> {/* Space for the AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default Sidebar;