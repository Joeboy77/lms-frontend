import { useState } from "react";
import { TextField, Button, Typography, Box, Card, Alert } from "@mui/material";
import axios from "axios";
import authStyles from "../styles/authStyles";
import AuthFooter from "../components/AuthFooter";

const Login = () => {
  const [formData, setFormData] = useState({ username: "", pin: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await axios.post("https://lms-backend-cntm.onrender.com/api/auth/login", formData);
      const { token } = response.data;
      localStorage.setItem('token', token);
      setMessage(response.data.message);
      setSuccess(true);
      if (response.data.role === 'admin') {
        window.location.href = '/admin/dashboard';
      } else {
        window.location.href = '/student/dashboard';
      }
    } catch (error) {
      setMessage("Invalid credentials.");
      setSuccess(false);
    }
    setLoading(false);
  };

  return (
    <Box sx={{ 
      maxWidth: 400, 
      margin: "120px auto 0",  // Added top margin to account for navbar
      padding: 3 
    }}>
      {message && (
        <Alert 
          severity={success ? "success" : "error"} 
          sx={{ mb: 2, mt: 2 }}
        >
          {message}
        </Alert>
      )}
      <Card sx={authStyles.card}>
        <Typography variant="h5" gutterBottom>Login</Typography>
        <TextField fullWidth label="Student ID" name="username" onChange={handleChange} sx={authStyles.input} />
        <TextField fullWidth type="password" label="PIN" name="pin" onChange={handleChange} sx={authStyles.input} />
        <Typography variant="body2" mt={1}>
          Don't have an account? <Button href="/signup" color="primary">Sign up</Button>
        </Typography>
        <Button fullWidth variant="contained" color="primary" onClick={handleLogin} sx={authStyles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <AuthFooter />
      </Card>
    </Box>
  );
};

export default Login;
