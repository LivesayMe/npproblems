import React from 'react';
import { Box, Grid, Tabs, Typography, Tab, List, ListItem, ListItemText, TextField } from '@mui/material';

function Overview(props) {
    const [selectedRegion, setSelectedRegion] = React.useState("NA");
    const [selectedDivision, setSelectedDivision] = React.useState("div1");
    const [selectedQualifier, setSelectedQualifier] = React.useState("main");


    const [search, setSearch] = React.useState("");

    const filter = (teams) => {
        return teams.filter((team) => team.name.toLowerCase().includes(search.toLowerCase()));
    }

    return (
        <>{props.regionTeams && (
            <Grid container spacing={2} sx={{ maxWidth: "1150px", width: "100%", height: "80vh", p: 1, m: 0, justifyContent: "center", alignItems: "center", display: "flex", flexDirection: {xs: "column", sm: "column", md: "row", lg: "row"} }}>
                {/* Left List Box */}
                <Grid item xs={3} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", bgcolor: "primary.light", height: "100%", width: "100%" }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        All Teams
                    </Typography>
                    <TextField sx={{
                        width: "100%",
                        bgcolor: "background.paper",
                        borderRadius: 1,
                        mb: 1,
                        mt: 1
                    }} id="outlined-basic" label="Search" variant="outlined" onChange={(e) => setSearch(e.target.value)} />
                    <List sx={{ width: "100%", bgcolor: "background.paper", overflow: "auto", height: "100%", borderRadius: 4, mb: 1 }}>
                        {filter(props.getAllTeams(true)).map((team) => (
                            <ListItem key={team.id}>
                                <ListItemText primary={team.name} secondary={
                                    <React.Fragment>
                                        <Typography
                                            sx={{ display: 'inline' }}
                                            component="span"
                                            variant="body2"
                                            color="text.primary"
                                        >
                                            {team.points} Points
                                        </Typography>
                                        {" — " + Math.round(team.elo, 5) + " Elo"}
                                    </React.Fragment>
                                }/>
                            </ListItem>
                        ))}
                    </List>
                </Grid>

                {/* Center Information */}
                <Grid item xs={6} 
                sx={{ 
                    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", bgcolor: "primary.light", height: "100%", width: "100%",
                    border: 5,
                    borderColor: "primary.light",
                }}>
                    <Tabs value={selectedRegion} onChange={(e, v) => setSelectedRegion(v)} aria-label="region tabs" sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "row",
                        overflow: "wrap",
                    }}>
                        {props.regions.map((region) => (
                            <Tab label={region} value={region} key={region}/>
                        ))}
                    </Tabs>
                    <Tabs value = {selectedDivision} onChange={(e, v) => setSelectedDivision(v)} aria-label="division tabs">
                        <Tab label="Division 1" value="div1" key="div1"/>
                        <Tab label="Division 2" value="div2" key="div2"/>
                    </Tabs>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {selectedRegion} Teams
                    </Typography>
                    <List sx={{ width: "100%", height: "100%", bgcolor: "background.paper" }}>
                        {selectedDivision === "div2" ? 
                        <>
                            <Tabs value = {selectedQualifier} onChange={(e, v) => setSelectedQualifier(v)} aria-label="qualifier tabs">
                                <Tab label="Main Qualifier" value="main" key="main"/>
                                <Tab label="Closed Qualifier" value="closed_qual" key="closed_qual"/>
                                <Tab label="Open Qualifier" value="open_qual" key="open_qual"/>
                            </Tabs>
                            {(props.regionTeams[selectedRegion][selectedDivision][selectedQualifier]).map((team) => (
                                <ListItem key={team.id}>
                                    <ListItemText primary={team.name} />
                                </ListItem>
                            ))}
                        </>
                        :
                        <>
                            {(props.regionTeams[selectedRegion][selectedDivision]).map((team) => (
                                <ListItem key={team.id}>
                                    <ListItemText primary={team.name} />
                                </ListItem>
                            ))}
                        </>
                        }
                    </List>
                </Grid>
            </Grid>
        )}</>
    );
}

export default Overview;