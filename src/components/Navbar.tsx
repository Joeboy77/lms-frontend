import { AppBar, Toolbar, Typography } from "@mui/material";

const Navbar = () => {
  return (
    <AppBar position="fixed" sx={{ width: `calc(100% - 240px)`, ml: `240px` }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Joe Expo Cohort Panel
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
