import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Grid,
  Container,
  Paper,
  Divider,
  Chip,
  CardActionArea,
  Stack,
  Fade
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import QuizIcon from "@mui/icons-material/Quiz";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import DateRangeIcon from "@mui/icons-material/DateRange";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import HistoryIcon from "@mui/icons-material/History";

const StudentQuizzes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quizzes, setQuizzes] = useState<{ available: any[]; past: any[] }>({
    available: [],
    past: [],
  });

  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("https://lms-backend-cntm.onrender.com/api/student/quizzes", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Ensure response structure
        setQuizzes({
          available: response.data?.available ?? [],
          past: response.data?.past ?? [],
        });

      } catch (err: any) {
        setError("Failed to fetch quizzes.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  // Format date to be more readable
  const formatDate = (dateString: string | number | Date) => {
    const options = { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    } as const;
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Calculate time remaining for available quizzes
  const getTimeRemaining = (dueDate: string | number | Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Due now";
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ${diffHours} hr${diffHours > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hr${diffHours > 1 ? 's' : ''} remaining`;
    }
  };

  // Determine chip color based on time remaining
  const getUrgencyColor = (dueDate: string | number | Date) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 12) return "error";
    if (diffHours < 24) return "warning";
    return "success";
  };

  // Loading state with a nicer centered spinner
  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <CircularProgress size={60} thickness={4} />
    </Box>
  );

  // Error state with a more descriptive message
  if (error) return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Alert 
        severity="error" 
        variant="filled"
        sx={{ borderRadius: 2, boxShadow: 2 }}
      >
        {error} Please try refreshing the page or contact support if the problem persists.
      </Alert>
    </Container>
  );

  return (
    <Container maxWidth="lg">
      <Box sx={{ padding: { xs: "1rem", md: "2rem" }, mt: 2 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 3, 
            mb: 4, 
            borderRadius: 3, 
            background: 'linear-gradient(45deg, #f5f7fa 0%, #e4e7eb 100%)',
            boxShadow: '0 3px 5px rgba(0,0,0,0.1)'
          }}
        >
          <Typography 
            variant="h4" 
            component="h1" 
            fontWeight="bold" 
            color="primary"
            sx={{ mb: 1 }}
          >
            My Quizzes
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track your upcoming and completed assessments
          </Typography>
        </Paper>
        
        {/* Available Quizzes Section */}
        <Box mb={5}>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <QuizIcon color="primary" />
            <Typography variant="h5" fontWeight="medium">Available Quizzes</Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          
          {quizzes.available.length === 0 ? (
            <Alert 
              severity="info" 
              variant="outlined"
              icon={false}
              sx={{ 
                borderRadius: 2, 
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                p: 2
              }}
            >
              <Typography variant="body1">
                You don't have any available quizzes at the moment. Check back later!
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {quizzes.available.map((quiz, index) => (
                <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                  <Fade in={true} timeout={500 + (index * 100)}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                        '&:hover': { 
                          transform: 'translateY(-4px)', 
                          boxShadow: '0 8px 16px rgba(0,0,0,0.1)' 
                        }
                      }}
                    >
                      <CardActionArea 
                        onClick={() => navigate(`/student/take-quiz/${quiz.id}`)}
                        sx={{ height: '100%', p: 1 }}
                      >
                        <CardContent>
                          <Chip 
                            label={getTimeRemaining(quiz.due_date)} 
                            size="small"
                            color={getUrgencyColor(quiz.due_date)}
                            sx={{ mb: 2, borderRadius: 1 }}
                          />
                          <Typography 
                            variant="h6" 
                            gutterBottom
                            sx={{ fontWeight: 'bold', fontSize: '1.1rem', mb: 2 }}
                          >
                            {quiz.title}
                          </Typography>
                          
                          <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <DateRangeIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                Due: {formatDate(quiz.due_date)}
                              </Typography>
                            </Stack>
                            
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <AccessTimeIcon fontSize="small" color="action" />
                              <Typography variant="body2" color="text.secondary">
                                Duration: {quiz.duration_minutes} minutes
                              </Typography>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
        
        {/* Past Quizzes Section */}
        <Box>
          <Stack direction="row" alignItems="center" spacing={1} mb={2}>
            <HistoryIcon color="primary" />
            <Typography variant="h5" fontWeight="medium">Past Quizzes</Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          
          {quizzes.past.length === 0 ? (
            <Alert 
              severity="info"
              variant="outlined"
              icon={false}
              sx={{ 
                borderRadius: 2, 
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                p: 2
              }}
            >
              <Typography variant="body1">
                You haven't completed any quizzes yet.
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {quizzes.past.map((quiz, index) => (
                <Grid item xs={12} sm={6} md={4} key={quiz.id}>
                  <Fade in={true} timeout={500 + (index * 100)}>
                    <Card 
                      sx={{ 
                        height: '100%',
                        borderRadius: 2,
                        backgroundColor: 'rgba(245, 245, 245, 0.8)'
                      }}
                    >
                      <CardContent>
                        <Typography 
                          variant="h6" 
                          gutterBottom
                          sx={{ fontWeight: 'medium', mb: 2, color: 'text.primary' }}
                        >
                          {quiz.title}
                        </Typography>
                        
                        <Stack spacing={1.5} sx={{ mb: 2 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <DateRangeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              Completed: {formatDate(quiz.due_date)}
                            </Typography>
                          </Stack>
                          
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <AccessTimeIcon fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              Duration: {quiz.duration_minutes} minutes
                            </Typography>
                          </Stack>
                        </Stack>
                        
                        <Stack 
                          direction="row" 
                          alignItems="center" 
                          spacing={1}
                          sx={{ 
                            mt: 2,
                            p: 1.5,
                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                            borderRadius: 1.5,
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                          }}
                        >
                          <EmojiEventsIcon 
                            fontSize="small" 
                            color={quiz.score > 80 ? "success" : quiz.score > 60 ? "warning" : "error"} 
                          />
                          <Typography 
                            variant="body1" 
                            fontWeight="bold"
                            color={quiz.score > 80 ? "success.main" : quiz.score > 60 ? "warning.main" : "error.main"}
                          >
                            Score: {quiz.score ? `${quiz.score}/100` : "Not graded"}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Box>
    </Container>
  );
};

export default StudentQuizzes;