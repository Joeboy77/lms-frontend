import { useState, useEffect } from "react";
import { TextField, Button, Typography, Box, Card } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authStyles from "../styles/authStyles";
import AuthFooter from "../components/AuthFooter";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const schema = yup.object().shape({
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  pin: yup.string().min(4, "PIN must be at least 4 digits").required("PIN is required"),
  profilePicture: yup.mixed().required("Profile picture is required"),
});

const Signup = () => {
  const { control, handleSubmit, setValue } = useForm({
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (data: any) => {
    setLoading(true);
    const formData = new FormData();
  
    // Append form fields
    formData.append("email", data.email);
    formData.append("phone", data.phone);
    formData.append("first_name", data.firstName);
    formData.append("last_name", data.lastName);
    formData.append("pin", data.pin);
  
    // Append file if selected
    if (data.profilePicture) {
      formData.append("profile_picture", data.profilePicture);
    }
  
    try {
      const response = await axios.post("https://lms-backend-cntm.onrender.com/api/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setMessage(response.data.message);
    } catch (error: any) {
      console.error("Signup Error:", error.response?.data);
  
      if (error.response?.data?.message.includes("Email is already registered")) {
        setMessage("This email is already in use. Please try a different email.");
      } else {
        setMessage(error.response?.data?.message || "Signup failed. Try again.");
      }
    }
  
    setLoading(false);
  };
  const navigate = useNavigate();

  useEffect(() => {
    if (message && !message.includes("failed")) {
      // If signup was successful, redirect to login after 2 seconds
      const timer = setTimeout(() => {
        navigate("/");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message, navigate]);
  

  return (
    <Box sx={authStyles.container}>
      <Card sx={authStyles.card}>
        <Typography variant="h5" gutterBottom>Signup</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller name="email" control={control} render={({ field }) => <TextField fullWidth label="Email" {...field} sx={authStyles.input} />} />
          <Controller name="phone" control={control} render={({ field }) => <TextField fullWidth label="Phone" {...field} sx={authStyles.input} />} />
          <Controller name="firstName" control={control} render={({ field }) => <TextField fullWidth label="First Name" {...field} sx={authStyles.input} />} />
          <Controller name="lastName" control={control} render={({ field }) => <TextField fullWidth label="Last Name" {...field} sx={authStyles.input} />} />
          <Controller name="pin" control={control} render={({ field }) => <TextField fullWidth type="password" label="PIN" {...field} sx={authStyles.input} />} />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                setValue("profilePicture", e.target.files[0]);
                }
            }}
            style={{ marginBottom: "1rem", width: "100%" }}
            />
          <Typography variant="body2" mt={1}>
            Already have an account? <Button href="/" color="primary">Login</Button>
          </Typography>
          <Button fullWidth variant="contained" color="primary" type="submit" sx={authStyles.button} disabled={loading}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </form>
        {message && <Typography color={message.includes("failed") ? "error" : "success"} mt={2}>{message}</Typography>}
        <AuthFooter />
      </Card>
    </Box>
  );
};

export default Signup;
