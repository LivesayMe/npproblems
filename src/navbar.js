import React from "react";
import { Box, Button, Grid, MenuItem, Modal, Select, Typography } from "@mui/material";

function Navbar() {
    return <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, m: 0, bgcolor: "primary.main", width: "100%" }}>
        <a href={"/"} style={{ textDecoration: "none" }}>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Home
            </Typography>
        </a>
    </Box>;
}

export default Navbar;