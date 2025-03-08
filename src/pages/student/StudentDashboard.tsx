import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Card,
  CardContent,
  Alert,
  useTheme,
  useMediaQuery,
  Container,
} from '@mui/material';
import axios from 'axios';

interface QuizResult {
  id: number;
  title: string;
  score: number;
  submitted_at: string;
}

interface DashboardData {
  student: {
    name: string;
  };
  averageScore: number;
  upcomingQuizzes: number;
  completedQuizzes: number;
  recentResults: QuizResult[];
}

const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<DashboardData>(
          'https://lms-backend-cntm.onrender.com/api/student/dashboard',
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDashboardData(response.data);
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "#4caf50"; // Green for good
    if (score >= 60) return "#ff9800"; // Orange for average
    return "#f44336"; // Red for needs improvement
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 'calc(100vh - 64px)'
      }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h4" 
        gutterBottom 
        sx={{ 
          fontWeight: 600, 
          fontSize: { xs: '1.5rem', sm: '2rem', md: '2.25rem' },
          mb: 3
        }}
      >
        Welcome back, {dashboardData?.student?.name}!
      </Typography>

      <Grid container spacing={3}>
        {/* Performance Statistics */}
        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              backgroundColor: "#e3f2fd",
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Quiz Performance</Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                color: getScoreColor(dashboardData?.averageScore || 0), 
                mb: 1,
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3rem' } 
              }}
            >
              {dashboardData?.averageScore || 0}%
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">Average Score</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              backgroundColor: "#f3e5f5",
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Upcoming Quizzes</Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                color: "#7b1fa2", 
                mb: 1,
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3rem' }  
              }}
            >
              {dashboardData?.upcomingQuizzes || 0}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">To be completed</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              backgroundColor: "#e8f5e9",
              borderRadius: 2,
              height: '100%',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: theme.shadows[8],
              }
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>Completed Quizzes</Typography>
            <Typography 
              variant="h3" 
              sx={{ 
                color: "#388e3c", 
                mb: 1,
                fontWeight: 700,
                fontSize: { xs: '2rem', md: '3rem' }  
              }}
            >
              {dashboardData?.completedQuizzes || 0}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">Total completed</Typography>
          </Paper>
        </Grid>

        {/* Recent Results Section */}
        <Grid item xs={12}>
          <Typography 
            variant="h5" 
            sx={{ 
              mt: 4, 
              mb: 2,
              fontWeight: 600,
              fontSize: { xs: '1.25rem', md: '1.5rem' }
            }}
          >
            Recent Quiz Results
          </Typography>
          <Grid container spacing={2}>
            {dashboardData?.recentResults && dashboardData.recentResults.length > 0 ? (
              dashboardData.recentResults.map((result) => (
                <Grid item xs={12} sm={6} key={result.id}>
                  <Card 
                    elevation={2} 
                    sx={{ 
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: theme.shadows[6],
                      }
                    }}
                  >
                    <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 500,
                          fontSize: { xs: '1rem', md: '1.25rem' }
                        }}
                      >
                        {result.title}
                      </Typography>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          mb: 1
                        }}
                      >
                        <Box 
                          sx={{ 
                            width: 10, 
                            height: 10, 
                            borderRadius: '50%', 
                            backgroundColor: getScoreColor(result.score),
                            mr: 1 
                          }} 
                        />
                        <Typography 
                          color="textSecondary" 
                          sx={{ 
                            color: getScoreColor(result.score),
                            fontWeight: 600
                          }}
                        >
                          Score: {result.score}%
                        </Typography>
                      </Box>
                      <Typography 
                        color="text.secondary" 
                        variant="body2"
                        sx={{ fontSize: '0.875rem' }}
                      >
                        Completed: {new Date(result.submitted_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert 
                  severity="info" 
                  sx={{ 
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      alignItems: 'center'
                    }
                  }}
                >
                  No recent quiz results available.
                </Alert>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;