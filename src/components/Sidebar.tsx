import { useState, useEffect } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Divider, Box } from "@mui/material";
import { Dashboard, Assignment, Quiz, Menu, Logout } from "@mui/icons-material";
import { NavLink, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const sidebarContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <NavLink
              to={item.path}
              style={{
                display: "flex",
                width: "100%",
                padding: "10px",
                textDecoration: "none",
                color: "inherit",
                alignItems: "center",
              }}
              onClick={() => setMobileOpen(false)} // Close menu on mobile when clicking
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </NavLink>
          </ListItem>
        ))}
      </List>
      <Divider />
      {/* Logout button at bottom */}
      <Box sx={{ mt: 'auto', mb: 2 }}>
        <ListItem
          component="div"
          sx={{
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
            cursor: 'pointer'
          }}
          onClick={handleLogout}
        >
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <IconButton 
        onClick={() => setMobileOpen(true)} 
        sx={{ 
          display: { xs: "block", md: "none" },
          position: 'fixed',
          top: 10,
          left: 10,
          zIndex: 1100
        }}
      >
        <Menu />
      </IconButton>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: { xs: "100%", md: 240 },
          "& .MuiDrawer-paper": { 
            width: 240,
            boxSizing: 'border-box',
            backgroundColor: '#f5f5f5'
          },
          display: { xs: mobileOpen ? "block" : "none", md: "block" },
        }}
        onClose={() => setMobileOpen(false)}
      >
        {sidebarContent}
      </Drawer>
    </>
  );
};

export default Sidebar;
