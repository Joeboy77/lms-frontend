import { useState } from "react";
import { TextField, Button, Typography, Box, MenuItem, IconButton, Alert } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import axios from "axios";
import { Add, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  due_date: yup.string().required("Due date is required"),
  duration: yup.number().min(1, "Duration must be at least 1 minute").required("Duration is required"),
});

const CreateQuiz = () => {
  const navigate = useNavigate();
  const { control, handleSubmit } = useForm({ resolver: yupResolver(schema) });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [questions, setQuestions] = useState<
    { text: string; type: string; options: string[]; correct_answers: string[] }[]
  >([
    { text: "", type: "mcq", options: ["", "", "", ""], correct_answers: [] },
  ]);

  // Add a new question
  const addQuestion = () => {
    setQuestions([...questions, { text: "", type: "mcq", options: ["", "", "", ""], correct_answers: [] }]);
  };

  // Remove a question
  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      const updatedQuestions = [...questions];
      updatedQuestions.splice(index, 1);
      setQuestions(updatedQuestions);
    }
  };

  // Toggle correct answer selection for MCQs
  const handleCorrectMCQChange = (qIndex: number, optIndex: number) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      const selectedOption = updatedQuestions[qIndex].options[optIndex];
      updatedQuestions[qIndex].correct_answers = [selectedOption];
      return updatedQuestions;
    });
  };

  // Handle fill-in-the-blank correct answer input
  const handleCorrectFillInChange = (qIndex: number, value: string) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[qIndex].correct_answers = [value.trim()];
      return updatedQuestions;
    });
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log("Token:", token);

      const response = await axios.post(
        "https://lms-backend-cntm.onrender.com/api/admin/create-quiz",
        {
          ...data,
          questions,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error creating quiz.");
      console.error("Error:", error.response?.data);
    }
    setLoading(false);
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>Create Quiz</Typography>

      {success && <Alert severity="success">Quiz created successfully! Redirecting to dashboard...</Alert>}
      {message && <Alert severity="error">{message}</Alert>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller name="title" control={control} render={({ field }) => <TextField fullWidth label="Quiz Title" {...field} sx={{ mb: 2 }} />} />
        <Controller name="due_date" control={control} render={({ field }) => <TextField fullWidth type="datetime-local" label="Due Date" {...field} sx={{ mb: 2 }} />} />
        <Controller name="duration" control={control} render={({ field }) => <TextField fullWidth type="number" label="Duration (minutes)" {...field} sx={{ mb: 2 }} />} />

        <Typography variant="h5" mt={3}>Questions</Typography>
        {questions.map((question, qIndex) => (
          <Box key={qIndex} sx={{ border: "1px solid #ddd", padding: 2, mb: 2, borderRadius: "8px" }}>
            <TextField fullWidth label={`Question ${qIndex + 1}`} value={question.text} sx={{ mb: 2 }}
              onChange={(e) => setQuestions((prev) => {
                const updated = [...prev];
                updated[qIndex].text = e.target.value;
                return updated;
              })}
            />

            <TextField select fullWidth label="Question Type" value={question.type} sx={{ mb: 2 }}
              onChange={(e) => setQuestions((prev) => {
                const updated = [...prev];
                updated[qIndex].type = e.target.value;
                updated[qIndex].correct_answers = [];
                return updated;
              })}
            >
              <MenuItem value="mcq">Multiple Choice</MenuItem>
              <MenuItem value="fill_in">Fill in the Blank</MenuItem>
            </TextField>

            {/* MCQ Options */}
            {question.type === "mcq" && question.options.map((option, optIndex) => (
              <Box 
                key={optIndex} 
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  mb: 1,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateX(10px)'
                  }
                }}
              >
                <TextField 
                  fullWidth 
                  label={`Option ${optIndex + 1}`} 
                  value={option}
                  onChange={(e) => setQuestions((prev) => {
                    const updated = [...prev];
                    updated[qIndex].options[optIndex] = e.target.value;
                    return updated;
                  })}
                  sx={{
                    backgroundColor: question.correct_answers.includes(option) ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                    '& .MuiOutlinedInput-root': {
                      borderColor: question.correct_answers.includes(option) ? '#4caf50' : 'inherit'
                    }
                  }}
                />
                <Button
                  variant={question.correct_answers.includes(option) ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => handleCorrectMCQChange(qIndex, optIndex)}
                  sx={{ 
                    ml: 1, 
                    minWidth: '120px',
                    backgroundColor: question.correct_answers.includes(option) ? "#4caf50" : "",
                    '&:hover': {
                      backgroundColor: question.correct_answers.includes(option) ? "#45a049" : "",
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {question.correct_answers.includes(option) ? "✓ Correct" : "Select"}
                </Button>
              </Box>
            ))}

            {/* Fill in the blank answer input */}
            {question.type === "fill_in" && (
              <TextField
                fullWidth
                label="Correct Answer"
                value={question.correct_answers[0] || ""}
                onChange={(e) => handleCorrectFillInChange(qIndex, e.target.value)}
                sx={{ mb: 2 }}
              />
            )}

            {/* Remove Question Button */}
            <IconButton onClick={() => removeQuestion(qIndex)} color="error">
              <Delete />
            </IconButton>
          </Box>
        ))}

        {/* Add Question Button */}
        <Button variant="outlined" onClick={addQuestion} startIcon={<Add />} sx={{ mb: 3 }}>
          Add Question
        </Button>

        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Quiz"}
        </Button>
      </form>
    </Box>
  );
};

export default CreateQuiz;
