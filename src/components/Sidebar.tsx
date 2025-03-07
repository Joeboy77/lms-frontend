import { useState, useEffect } from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton } from "@mui/material";
import { Dashboard, Assignment, Quiz, Menu } from "@mui/icons-material";
import { NavLink } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Sidebar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

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

  // Admin Sidebar Items
  const adminMenuItems = [
    { text: "Dashboard", icon: <Dashboard />, path: "/student/dashboard" },
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

  return (
    <>
      {/* Mobile Toggle Button */}
      <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { xs: "block", md: "none" } }}>
        <Menu />
      </IconButton>

      {/* Sidebar Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          width: { xs: "100%", md: 240 },
          "& .MuiDrawer-paper": { width: 240 },
          display: { xs: mobileOpen ? "block" : "none", md: "block" },
        }}
        onClose={() => setMobileOpen(false)}
      >
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
      </Drawer>
    </>
  );
};

export default Sidebar;
