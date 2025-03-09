import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    Box, 
    Typography, 
    RadioGroup, 
    FormControlLabel, 
    Radio, 
    Button, 
    CircularProgress, 
    Alert,
    TextField,
    LinearProgress,
    Paper,
    Dialog,
    DialogContent,
    Fade,
    Container,
    Stack,
    Divider,
    Chip,
    Avatar,
    Card,
    IconButton,
    Tooltip
} from "@mui/material";
import axios from "axios";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import WarningIcon from '@mui/icons-material/Warning';

interface Question {
    id: number;
    text: string;
    type: 'mcq' | 'fill_in';
    options: string[];
}

interface Quiz {
    id: number;
    title: string;
    description: string;
    duration_minutes: number;
    questions: Question[];
}

interface QuizScore {
    score: number;
    correctAnswers: number;
    totalQuestions: number;
    questionDetails?: {
        question: string;
        type: 'mcq' | 'fill_in';
        studentAnswer: string;
        correctAnswer: string;
        isCorrect: boolean;
    }[];
}

const TakeQuiz = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [answers, setAnswers] = useState<{ [key: number]: string }>({});
    const [submitted, setSubmitted] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(0);
    const [score, setScore] = useState<number | null>(null);
    const [showScore, setShowScore] = useState(false);
    const [quizScore, setQuizScore] = useState<QuizScore | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [warnings, setWarnings] = useState(0);
    const [isFullScreen, setIsFullScreen] = useState(false);
    const MAX_WARNINGS = 3;
    const [showWarningDialog, setShowWarningDialog] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');

    // Calculate completion percentage
    const getCompletionPercentage = () => {
        if (!quiz?.questions) return 0;
        const answeredCount = Object.keys(answers).length;
        return (answeredCount / quiz.questions.length) * 100;
    };

    // Format time in a readable format
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Get timer color based on remaining time
    const getTimerColor = () => {
        if (!quiz) return "primary";
        const totalTime = quiz.duration_minutes * 60;
        const percentageLeft = (timeLeft / totalTime) * 100;
        
        if (percentageLeft < 25) return "error";
        if (percentageLeft < 50) return "warning";
        return "primary";
    };

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`https://lms-backend-cntm.onrender.com/api/student/quiz/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.data) {
                    setError("Quiz not found");
                    return;
                }

                // Check if student has already taken this quiz
                const resultResponse = await axios.get(
                    `https://lms-backend-cntm.onrender.com/api/student/quiz-result/${id}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                if (resultResponse.data.hasCompleted) {
                    setError("You have already completed this quiz");
                    return;
                }

                setQuiz(response.data);
                setTimeLeft(response.data.duration_minutes * 60);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load quiz");
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (timeLeft > 0 && !submitted) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        handleSubmit(); // Auto-submit when time runs out
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft, submitted]);

    useEffect(() => {
        if (!submitted && quiz) {
            const handleVisibilityChange = () => {
                if (document.hidden) {
                    setWarnings(prev => {
                        const newWarnings = prev + 1;
                        setWarningMessage(`Warning ${newWarnings}/${MAX_WARNINGS}: Switching tabs or windows is not allowed during the quiz.`);
                        setShowWarningDialog(true);
                        
                        if (newWarnings >= MAX_WARNINGS) {
                            handleForcedSubmit();
                            return prev;
                        }
                        return newWarnings;
                    });
                }
            };

            const handleFullScreenChange = () => {
                if (!document.fullscreenElement) {
                    setWarnings(prev => {
                        const newWarnings = prev + 1;
                        setWarningMessage(`Warning ${newWarnings}/${MAX_WARNINGS}: Exiting full-screen mode is not allowed during the quiz.`);
                        setShowWarningDialog(true);

                        if (newWarnings >= MAX_WARNINGS) {
                            handleSubmit();
                            return prev;
                        }
                        return newWarnings;
                    });
                } else {
                    setIsFullScreen(true);
                }
            };

            // Add event listeners
            document.addEventListener('visibilitychange', handleVisibilityChange);
            document.addEventListener('fullscreenchange', handleFullScreenChange);

            // Request full screen on start
            if (!isFullScreen) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log("Error attempting to enable full-screen mode:", err);
                });
            }

            return () => {
                document.removeEventListener('visibilitychange', handleVisibilityChange);
                document.removeEventListener('fullscreenchange', handleFullScreenChange);
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                }
            };
        }
    }, [quiz, submitted, isFullScreen]);

    const handleSubmit = async () => {
        if (submitted) return;
        
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `https://lms-backend-cntm.onrender.com/api/student/submit-quiz/${id}`,
                { answers },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            setQuizScore(response.data);
            setScore(response.data.score);
            setSubmitted(true);
            setShowScore(true);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to submit quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleForcedSubmit = async () => {
        if (submitted) return;
        
        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `https://lms-backend-cntm.onrender.com/api/student/submit-quiz/${id}`,
                { 
                    answers,
                    forcedSubmission: true
                },
                { headers: { Authorization: `Bearer ${token}` }}
            );
            
            setQuizScore(response.data);
            setScore(response.data.score);
            setSubmitted(true);
            setShowScore(true);
            
            // Show warning message
            setWarningMessage("Quiz has been automatically submitted due to multiple warnings.");
            setShowWarningDialog(true);
            
            // Redirect after a delay
            setTimeout(() => {
                navigate('/student/test-quizzes');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to submit quiz");
        } finally {
            setLoading(false);
        }
    };

    const handleNextQuestion = () => {
        if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
        }
    };

    // Render loading state
    if (loading) return (
        <Container maxWidth="md" sx={{ paddingTop: "100px", display: "flex", justifyContent: "center" }}>
            <CircularProgress size={60} thickness={4} />
        </Container>
    );

    // Render error state
    if (error) return (
        <Container maxWidth="md" sx={{ paddingTop: "100px" }}>
            <Alert 
                severity="error" 
                variant="filled" 
                sx={{ 
                    borderRadius: 2, 
                    boxShadow: 2,
                    marginBottom: 2
                }}
            >
                {error}
            </Alert>
            <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate("/student/test-quizzes")}
            >
                Back to Quizzes
            </Button>
        </Container>
    );

    // Render quiz not found state
    if (!quiz) return (
        <Container maxWidth="md" sx={{ paddingTop: "100px" }}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>Quiz not found</Alert>
            <Button 
                variant="outlined" 
                startIcon={<ArrowBackIcon />} 
                onClick={() => navigate("/student/test-quizzes")}
                sx={{ mt: 2 }}
            >
                Back to Quizzes
            </Button>
        </Container>
    );

    // Get current question
    const currentQuestion = quiz.questions[currentQuestionIndex];

    return (
        <Container maxWidth="md" sx={{ paddingTop: "100px", paddingBottom: "40px" }}>
            {/* Quiz Header */}
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
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <QuizIcon />
                    </Avatar>
                    <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
                        {quiz.title}
                    </Typography>
                </Stack>
                <Typography variant="subtitle1" sx={{ mb: 3 }}>
                    {quiz.description}
                </Typography>
                
                <Divider sx={{ mb: 3 }} />
                
                {/* Timer and Progress */}
                <Stack 
                    direction={{ xs: 'column', sm: 'row' }} 
                    spacing={3} 
                    justifyContent="space-between"
                    alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                    {/* Timer */}
                    <Stack 
                        direction="row" 
                        spacing={1} 
                        alignItems="center" 
                        sx={{ 
                            p: 1.5, 
                            borderRadius: 2,
                            bgcolor: `${getTimerColor()}.light`,
                            color: `${getTimerColor()}.dark`,
                            minWidth: '140px'
                        }}
                    >
                        <AccessTimeIcon />
                        <Typography variant="h6" fontWeight="medium">
                            {formatTime(timeLeft)}
                        </Typography>
                    </Stack>
                    
                    {/* Progress */}
                    <Stack sx={{ flexGrow: 1 }}>
                        <Stack 
                            direction="row" 
                            justifyContent="space-between" 
                            alignItems="center"
                            sx={{ mb: 0.5 }}
                        >
                            <Typography variant="body2" color="text.secondary">
                                Questions: {Object.keys(answers).length}/{quiz.questions.length} answered
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="primary">
                                {Math.round(getCompletionPercentage())}% complete
                            </Typography>
                        </Stack>
                        <LinearProgress 
                            variant="determinate" 
                            value={getCompletionPercentage()}
                            sx={{ height: 8, borderRadius: 1 }}
                        />
                    </Stack>
                </Stack>
            </Paper>

            {/* Quiz Question Navigation */}
            <Stack 
                direction="row" 
                spacing={1} 
                sx={{ mb: 3, overflowX: 'auto', py: 1 }}
                alignItems="center"
            >
                {quiz.questions.map((question, index) => (
                    <Chip
                        key={question.id}
                        label={index + 1}
                        onClick={() => setCurrentQuestionIndex(index)}
                        color={answers[question.id] ? "primary" : "default"}
                        variant={currentQuestionIndex === index ? "filled" : "outlined"}
                        icon={answers[question.id] ? <CheckCircleIcon /> : undefined}
                        sx={{ minWidth: '40px' }}
                    />
                ))}
            </Stack>

            {/* Current Question */}
            <Fade in={true} key={currentQuestion.id}>
                <Card sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Typography 
                            variant="subtitle2" 
                            color="text.secondary"
                        >
                            Question {currentQuestionIndex + 1} of {quiz.questions.length}
                        </Typography>
                        <Tooltip title="Question Type">
                            <Chip 
                                size="small" 
                                label={currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'Fill in the Blank'} 
                                color="secondary"
                                variant="outlined"
                            />
                        </Tooltip>
                    </Stack>
                    
                    <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                            mb: 3, 
                            fontWeight: 'medium',
                            lineHeight: 1.4
                        }}
                    >
                        {currentQuestion.text}
                    </Typography>
                    
                    {currentQuestion.type === 'mcq' ? (
                        <RadioGroup
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                        >
                            <Stack spacing={1.5}>
                                {currentQuestion.options.map((option, optIndex) => (
                                    <Paper 
                                        key={optIndex}
                                        variant="outlined" 
                                        sx={{ 
                                            borderColor: answers[currentQuestion.id] === option ? 'primary.main' : 'divider',
                                            borderWidth: answers[currentQuestion.id] === option ? 2 : 1,
                                            p: 0.5,
                                            pl: 1,
                                            borderRadius: 2,
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                                            }
                                        }}
                                    >
                                        <FormControlLabel
                                            value={option}
                                            control={<Radio />}
                                            label={
                                                <Typography variant="body1" sx={{ py: 1 }}>
                                                    {option}
                                                </Typography>
                                            }
                                            disabled={submitted}
                                            sx={{ width: '100%', ml: 0 }}
                                        />
                                    </Paper>
                                ))}
                            </Stack>
                        </RadioGroup>
                    ) : (
                        <TextField
                            fullWidth
                            variant="outlined"
                            placeholder="Type your answer here"
                            value={answers[currentQuestion.id] || ''}
                            onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                            disabled={submitted}
                            multiline
                            rows={3}
                            sx={{ 
                                mt: 2,
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2
                                }
                            }}
                        />
                    )}
                </Card>
            </Fade>

            {/* Navigation and Submit Buttons */}
            <Stack 
                direction="row" 
                spacing={2} 
                justifyContent="space-between"
                sx={{ mt: 3 }}
            >
                <Button
                    variant="outlined"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0 || submitted}
                >
                    Previous
                </Button>
                
                <Stack direction="row" spacing={2}>
                    {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleNextQuestion}
                            disabled={submitted}
                        >
                            Next
                        </Button>
                    ) : (
                        <Button 
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            disabled={submitted || loading}
                            sx={{ minWidth: '120px' }}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Submit Quiz'}
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* Help Text */}
            <Stack 
                direction="row" 
                spacing={1} 
                alignItems="center" 
                sx={{ mt: 3, p: 2, backgroundColor: 'info.light', borderRadius: 2 }}
            >
                <HelpOutlineIcon color="info" />
                <Typography variant="body2" color="info.dark">
                    You can navigate between questions using the number buttons above or the Next/Previous buttons.
                    Your answers are saved automatically.
                </Typography>
            </Stack>

            {/* Score Dialog */}
            <Dialog 
                open={showScore} 
                onClose={() => navigate('/student/test-quizzes')}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 3, p: 2 }
                }}
            >
                <DialogContent>
                    <Stack spacing={4}>
                        {/* Score Summary */}
                        <Stack alignItems="center" spacing={3}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 60 }} />
                            
                            <Typography variant="h5" fontWeight="bold" textAlign="center">
                                Quiz Completed!
                            </Typography>
                            
                            <Paper
                                elevation={0}
                                sx={{ 
                                    bgcolor: 'primary.light', 
                                    p: 3, 
                                    borderRadius: 3,
                                    width: '100%'
                                }}
                            >
                                <Typography variant="h4" sx={{ color: 'primary.dark', textAlign: 'center', mb: 1 }}>
                                    Score: {quizScore?.correctAnswers}/{quizScore?.totalQuestions}
                                </Typography>
                                
                                <Typography variant="h5" sx={{ color: 'primary.dark', textAlign: 'center' }}>
                                    {quizScore?.score}%
                                </Typography>
                            </Paper>
                        </Stack>

                        {/* Detailed Feedback */}
                        <Box>
                            <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                                Detailed Feedback
                            </Typography>
                            <Stack spacing={2}>
                                {quizScore?.questionDetails?.map((detail, index) => (
                                    <Paper
                                        key={index}
                                        sx={{
                                            p: 2,
                                            borderRadius: 2,
                                            borderLeft: 6,
                                            borderColor: detail.isCorrect ? 'success.main' : 'error.main',
                                            bgcolor: detail.isCorrect ? 'success.light' : 'error.light',
                                            opacity: 0.9
                                        }}
                                    >
                                        <Stack spacing={1}>
                                            <Typography variant="subtitle1" fontWeight="medium">
                                                Question {index + 1}: {detail.question}
                                            </Typography>
                                            
                                            <Box sx={{ pl: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Your Answer: 
                                                    <Typography 
                                                        component="span" 
                                                        sx={{ 
                                                            ml: 1,
                                                            color: detail.isCorrect ? 'success.dark' : 'error.dark',
                                                            fontWeight: 'medium'
                                                        }}
                                                    >
                                                        {detail.studentAnswer || '(No answer provided)'}
                                                    </Typography>
                                                </Typography>
                                                
                                                <Typography variant="body2" color="text.secondary">
                                                    Correct Answer: 
                                                    <Typography 
                                                        component="span" 
                                                        sx={{ 
                                                            ml: 1,
                                                            color: 'success.dark',
                                                            fontWeight: 'medium'
                                                        }}
                                                    >
                                                        {detail.correctAnswer}
                                                    </Typography>
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                ))}
                            </Stack>
                        </Box>

                        <Button 
                            fullWidth 
                            variant="contained" 
                            size="large"
                            onClick={() => navigate('/student/test-quizzes')}
                        >
                            Return to Quizzes
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>

            {/* Warning Dialog */}
            <Dialog
                open={showWarningDialog}
                onClose={() => setShowWarningDialog(false)}
                PaperProps={{
                    sx: { borderRadius: 2, p: 2 }
                }}
            >
                <DialogContent>
                    <Stack spacing={2} alignItems="center">
                        <WarningIcon color="warning" sx={{ fontSize: 48 }} />
                        <Typography variant="h6" textAlign="center">
                            Warning!
                        </Typography>
                        <Typography textAlign="center" color="text.secondary">
                            {warningMessage}
                        </Typography>
                        {warnings >= MAX_WARNINGS && (
                            <Typography color="error" fontWeight="bold" textAlign="center">
                                Maximum warnings reached. Quiz will be submitted automatically and you will not be able to retake it.
                            </Typography>
                        )}
                        <Button 
                            variant="contained" 
                            onClick={() => setShowWarningDialog(false)}
                            sx={{ minWidth: 200 }}
                        >
                            {warnings >= MAX_WARNINGS ? 'Close' : 'I Understand'}
                        </Button>
                    </Stack>
                </DialogContent>
            </Dialog>
        </Container>
    );
};

export default TakeQuiz;