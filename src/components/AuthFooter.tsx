import { Box, Typography } from "@mui/material";

const AuthFooter = () => {
  return (
    <Box textAlign="center" mt={3} p={2}>
      <Typography variant="body2" color="textSecondary">
        © {new Date().getFullYear()} Joseph Acheampong. All rights reserved.
      </Typography>
    </Box>
  );
};

export default AuthFooter;
