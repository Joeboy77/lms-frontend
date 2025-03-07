import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Avatar,
  Card,
  CardContent,
  Alert,
  Fade,
  Zoom,
  Grow,
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<DashboardData>(
          'http://localhost:8080/api/student/dashboard',
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, marginTop: "80px", padding: "24px" }}>
      <Typography variant="h4" gutterBottom>
        Welcome back, {dashboardData?.student?.name}!
      </Typography>

      <Grid container spacing={3}>
        {/* Performance Statistics */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: "#e3f2fd" }}>
            <Typography variant="h6" gutterBottom>Quiz Performance</Typography>
            <Typography variant="h3" sx={{ color: getScoreColor(dashboardData?.averageScore || 0), mb: 1 }}>
              {dashboardData?.averageScore || 0}%
            </Typography>
            <Typography variant="subtitle1">Average Score</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: "#f3e5f5" }}>
            <Typography variant="h6" gutterBottom>Upcoming Quizzes</Typography>
            <Typography variant="h3" sx={{ color: "#7b1fa2", mb: 1 }}>
              {dashboardData?.upcomingQuizzes || 0}
            </Typography>
            <Typography variant="subtitle1">To be completed</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, backgroundColor: "#e8f5e9" }}>
            <Typography variant="h6" gutterBottom>Completed Quizzes</Typography>
            <Typography variant="h3" sx={{ color: "#388e3c", mb: 1 }}>
              {dashboardData?.completedQuizzes || 0}
            </Typography>
            <Typography variant="subtitle1">Total completed</Typography>
          </Paper>
        </Grid>

        {/* Recent Results Section */}
        <Grid item xs={12}>
          <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>
            Recent Quiz Results
          </Typography>
          <Grid container spacing={2}>
            {dashboardData?.recentResults && dashboardData.recentResults.length > 0 ? (
              dashboardData.recentResults.map((result) => (
                <Grid item xs={12} md={6} key={result.id}>
                  <Card elevation={2}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>{result.title}</Typography>
                      <Typography 
                        color="textSecondary" 
                        sx={{ color: getScoreColor(result.score) }}
                        gutterBottom
                      >
                        Score: {result.score}%
                      </Typography>
                      <Typography color="textSecondary">
                        Completed: {new Date(result.submitted_at).toLocaleDateString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Alert severity="info">No recent quiz results available.</Alert>
              </Grid>
            )}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default StudentDashboard;