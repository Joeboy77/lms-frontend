import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { Box } from "@mui/material";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Dashboard from "../pages/admin/Dashboard";
import CreateQuiz from "../pages/admin/CreateQuiz";
import UploadAssignment from "../pages/admin/UploadAssignment";
import StudentDashboard from "../pages/student/StudentDashboard";
import StudentQuizzes from "../pages/student/StudentQuizzes";
import StudentAssignments from "../pages/student/StudentAssignments";
import { jwtDecode } from "jwt-decode";
import { useEffect, useState } from "react";
import TakeQuiz from "../pages/student/TakeQuiz";
import StudentProfile from "../pages/student/StudentProfile";

const AppRoutes = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        setUserRole(decoded.role);
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);
  
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        {/* Admin Routes */}
        {userRole === "admin" && (
          <Route 
            path="/admin" 
            element={
              <Sidebar>
                <Box sx={{ p: 3 }}>
                  <Outlet />
                </Box>
              </Sidebar>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="create-quiz" element={<CreateQuiz />} />
            <Route path="upload-assignment" element={<UploadAssignment />} />
          </Route>
        )}
        
        {/* Student Routes */}
        {userRole === "student" && (
          <Route
            path="/student"
            element={
              <Sidebar>
                <Box sx={{ p: 3 }}>
                  <Outlet />
                </Box>
              </Sidebar>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="test-quizzes" element={<StudentQuizzes />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="take-quiz/:id" element={<TakeQuiz />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>
        )}
      </Routes>
    </Router>
  );
};

export default AppRoutes;