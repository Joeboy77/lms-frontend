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
  Container
} from "@mui/material";
import { 
  Dashboard, 
  Assignment, 
  Quiz, 
  Menu as MenuIcon, 
  Logout,
  ChevronLeft,
  ChevronRight
} from "@mui/icons-material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

// Define the sidebar width values
const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 65;

const Sidebar = () => {
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
        background: 'linear-gradient(to bottom, #3a4a5c, #2c3e50)',
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
              color: '#fff'
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
      
      <List sx={{ pt: 1, overflowY: 'auto' }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.text} disablePadding>
              <NavLink
                to={item.path}
                style={{
                  display: "flex",
                  width: "100%",
                  padding: collapsed ? "16px 0" : "12px 16px",
                  textDecoration: "none",
                  color: "#fff",
                  alignItems: "center",
                  justifyContent: collapsed ? "center" : "flex-start",
                  borderLeft: isActive ? "4px solid #4fc3f7" : "4px solid transparent",
                  backgroundColor: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                }}
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <ListItemIcon sx={{ 
                  color: isActive ? "#4fc3f7" : "#fff",
                  minWidth: collapsed ? 0 : 40,
                  marginRight: collapsed ? 0 : 2
                }}>
                  {item.icon}
                </ListItemIcon>
                {!collapsed && <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontSize: '0.95rem',
                    fontWeight: isActive ? 'bold' : 'normal'
                  }} 
                />}
              </NavLink>
            </ListItem>
          );
        })}
      </List>
      
      <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.1)', mt: 'auto' }} />
      
      {/* Logout button at bottom */}
      <Box sx={{ mb: 2 }}>
        <ListItem
          component="div"
          sx={{
            padding: collapsed ? "16px 0" : "12px 16px",
            justifyContent: collapsed ? "center" : "flex-start",
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
            },
            cursor: 'pointer'
          }}
          onClick={handleLogout}
        >
          <ListItemIcon sx={{ 
            color: '#ff5252', 
            minWidth: collapsed ? 0 : 40,
            marginRight: collapsed ? 0 : 2
          }}>
            <Logout />
          </ListItemIcon>
          {!collapsed && <ListItemText 
            primary="Logout" 
            primaryTypographyProps={{ 
              color: '#ff5252',
              fontSize: '0.95rem'
            }} 
          />}
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Fixed Top AppBar - Always visible on all devices */}
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: theme.zIndex.drawer + 2,
          backgroundColor: '#1a2c3b',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* This menu button is always visible on all screen sizes */}
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
            <Typography variant="h6" noWrap>
              Joe Expo Cohort Panel
            </Typography>
          </Box>
          
          {/* User role badge for top bar */}
          {userRole && (
            <Typography 
              variant="caption" 
              sx={{ 
                backgroundColor: userRole === 'admin' ? '#4fc3f7' : '#81c784', 
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontWeight: 'bold',
                textTransform: 'uppercase'
              }}
            >
              {userRole}
            </Typography>
          )}
        </Toolbar>
      </AppBar>

      {/* Toolbar spacer to push content below AppBar */}
      <Toolbar />
      
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
          pt: 3, // Add padding top for spacing below AppBar
          px: 3, // Add padding on sides
          ml: { xs: 0, md: `${sidebarWidth}px` },
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
      </Box>
    </>
  );
};

export default Sidebar;