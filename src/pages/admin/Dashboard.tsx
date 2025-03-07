import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";
import axios from "axios";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  quizzes_taken: number;
  average_score: number;
}

interface QuizResult {
  title: string;
  score: number;
  submitted_at: string;
}

interface StudentDetails {
  student: {
    first_name: string;
    last_name: string;
    email: string;
    username: string;
  };
  quizResults: QuizResult[];
}

interface SystemStats {
  overview: {
    total_students: number;
    total_quizzes: number;
    total_submissions: number;
    average_score: number;
  };
  monthlyStats: {
    month: string;
    submissions: number;
    average_score: number;
  }[];
}

const Dashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetails | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      const [studentsRes, statsRes] = await Promise.all([
        axios.get<Student[]>("http://localhost:8080/api/admin/students", { headers }),
        axios.get<SystemStats>("http://localhost:8080/api/admin/system-stats", { headers }),
      ]);

      setStudents(studentsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleStudentClick = async (studentId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get<StudentDetails>(
        `http://localhost:8080/api/admin/students/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSelectedStudent(response.data);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching student details:", error);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Box sx={{ padding: "2rem" }}>
      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Students</Typography>
              <Typography variant="h3">{stats?.overview?.total_students}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Quizzes</Typography>
              <Typography variant="h3">{stats?.overview?.total_quizzes}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total Submissions</Typography>
              <Typography variant="h3">{stats?.overview?.total_submissions}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Average Score</Typography>
              <Typography variant="h3">{stats?.overview?.average_score}%</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Charts */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Monthly Submissions</Typography>
            <BarChart width={500} height={300} data={stats?.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="submissions" fill="#8884d8" />
            </BarChart>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Average Scores Trend</Typography>
            <LineChart width={500} height={300} data={stats?.monthlyStats}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="average_score" stroke="#82ca9d" />
            </LineChart>
          </Paper>
        </Grid>

        {/* Students Table */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Students</Typography>
            <TextField
              fullWidth
              label="Search Students"
              variant="outlined"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Student ID</TableCell>
                    <TableCell>Quizzes Taken</TableCell>
                    <TableCell>Average Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.id}
                      onClick={() => handleStudentClick(student.id)}
                      sx={{ cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } }}
                    >
                      <TableCell>{`${student.first_name} ${student.last_name}`}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>{student.quizzes_taken}</TableCell>
                      <TableCell>{student.average_score}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Student Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Student Details
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Box>
              <Typography variant="h6">{`${selectedStudent.student.first_name} ${selectedStudent.student.last_name}`}</Typography>
              <Typography>Email: {selectedStudent.student.email}</Typography>
              <Typography>Student ID: {selectedStudent.student.username}</Typography>
              <Typography variant="h6" sx={{ mt: 2 }}>Quiz Results</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Quiz</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedStudent.quizResults.map((result, index) => (
                      <TableRow key={index}>
                        <TableCell>{result.title}</TableCell>
                        <TableCell>{result.score}%</TableCell>
                        <TableCell>
                          {new Date(result.submitted_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Dashboard;