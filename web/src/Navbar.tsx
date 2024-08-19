import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MonitorHeartIcon from "@mui/icons-material/MonitorHeart";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import Stack from "@mui/material/Stack";

const Navbar: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1 }}>
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{ fontSize: "1.25rem", fontWeight: "bold" }}
          >
            Confidential Diagnosis
          </Button>
        </Box>
        <Stack sx={{ height: 50 }} direction="row">
          <Button
            color="inherit"
            component={RouterLink}
            to="/"
            startIcon={<MonitorHeartIcon />}
            variant="outlined"
            style={{ marginRight: "1rem" }}
          >
            Heart Failure Prediction
          </Button>
          {/* <Button
            color="inherit"
            component={RouterLink}
            to="/multiple"
            startIcon={<HealthAndSafetyIcon />}
            variant="outlined"
          >
            Multiple Disease Prediction
          </Button> */}
        </Stack>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
