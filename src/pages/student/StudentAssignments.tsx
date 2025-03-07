import React from 'react';
import { Box, Typography, Paper, Container } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';

const StudentAssignments = () => {
  return (
    <Container maxWidth="md">
      <Box
        sx={{
          marginTop: "80px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center"
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(245, 245, 245, 0.9)"
          }}
        >
          <ConstructionIcon sx={{ fontSize: 60, color: "warning.main", mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Under Maintenance
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            The assignments feature is currently under development.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            We're working hard to bring you a great assignment submission experience.
            Please check back later!
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default StudentAssignments;