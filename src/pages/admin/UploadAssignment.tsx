import { useState } from "react";
import { TextField, Button, Box, Typography, Alert } from "@mui/material";
import axios from "axios";
import { AxiosError } from "axios"; 
import { useNavigate } from "react-router-dom";

const UploadAssignment = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: "", description: "", due_date: "", file: null });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e: any) => {
    if (e.target.name === "file") {
      setFormData({ ...formData, file: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleUpload = async () => {
    if (!formData.file) {
      setMessage("Please select a file to upload.");
      return;
    }
  
    setLoading(true);
    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("due_date", formData.due_date);
    form.append("file", formData.file);
  
    try {
      const token = localStorage.getItem("token");
  
      const response = await axios.post(
        "https://lms-backend-cntm.onrender.com/api/admin/upload-assignment",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      setSuccess(true);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message?: string }>; // Ensure response contains message
  
      console.error("Error:", axiosError.response?.data);
      
      setMessage(
        axiosError.response?.data?.message ?? "Error uploading assignment."
      );
    }
  
    setLoading(false);
  };
  

  return (
    <Box sx={{ marginLeft: "240px", padding: "2rem" }}>
      <Typography variant="h4" mb={3}>Upload Assignment</Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Assignment uploaded successfully! Redirecting to dashboard...
        </Alert>
      )}
      
      {message && !success && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {message}
        </Alert>
      )}

      <TextField fullWidth label="Title" name="title" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth label="Description" name="description" onChange={handleChange} sx={{ mb: 2 }} />
      <TextField fullWidth type="datetime-local" name="due_date" onChange={handleChange} sx={{ mb: 2 }} />
      <input type="file" name="file" onChange={handleChange} />

      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleUpload} 
        disabled={loading}
        sx={{ mt: 2 }}
      >
        {loading ? "Uploading..." : "Upload Assignment"}
      </Button>
    </Box>
  );
};

export default UploadAssignment;
