import React, { useEffect } from 'react';
import { Box, Grid, Tabs, Typography, Tab, List, ListItem, ListItemText, TextField, Breadcrumbs, Link } from '@mui/material';
import Competition from './competition';
import { Stack } from '@mui/system';
// Import css
import './tournament.css';

function Tournament(props) {
    const seasons = ["season1", "season2", "season3", "TI"]
    const events = ["qualifier", "major"]
    const regions = "NA WEU EEU SEA SA CN".split(" ")
    const divisions = ["div1", "div2"]
    const qualifiers = ["main", "closed_qual", "open_qual"]
    const [selectedSeason, setSelectedSeason] = React.useState(null);
    const [selectedEvent, setSelectedEvent] = React.useState(null);
    const [selectedRegion, setSelectedRegion] = React.useState(null);
    const [selectedDivision, setSelectedDivision] = React.useState(null);
    const [selectedQualifier, setSelectedQualifier] = React.useState(null);
    const [activeSelection, setActiveSelection] = React.useState("season");

    const [dpc, setDPC] = React.useState({});

    useEffect(() => {
        if (props.regionTeams == null)
            return;
        
        let dpc = {};
        for (let season of ["season1", "season2", "season3", "TI"]) {
            dpc[season] = {};
            if (season == "TI")
            {
                dpc[season] = {
                    invited_teams: [],
                    regional_teams: [],
                    lcq_teams: [],
                    group_results: [],
                    results: [],
                    regional: {
                        "NA": {
                            teams: [],
                            results: [],
                        },
                        "WEU": {
                            teams: [],
                            results: [],
                        },
                        "EEU": {
                            teams: [],
                            results: [],
                        },
                        "SEA": {
                            teams: [],
                            results: [],
                        },
                        "SA": {
                            teams: [],
                            results: [],
                        },
                        "CN": {
                            teams: [],
                            results: [],
                        },
                    },
                    lcq: {
                        teams: [],
                        results: [],
                    }
                }
            }

            dpc[season].div1 = {}
            dpc[season].div2 = {}
            for (let region of regions) {

                dpc[season].div1[region] = {
                    teams: props.regionTeams[region].div1,
                    results: [],
                }
                dpc[season].div2[region] = {
                    main: {teams: props.regionTeams[region].div2.main, results: []},
                    closed_qual: {teams: props.regionTeams[region].div2.closed_qual, results: []},
                    open_qual: {teams: props.regionTeams[region].div2.open_qual, results: []},
                }
            }
            dpc[season].major = {
                teams: [],
                group_results: [],
                results: [],
            }
        }
        setDPC(dpc);
    }, [props.regionTeams]);

    const getBreadcrumbs = () => {
        switch (activeSelection) {
            case "season": // empty
                return (
                    <Breadcrumbs aria-label="breadcrumb">
                    </Breadcrumbs>
                )
            case "ti": // season
            case "event": // season
                return (
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("season"); setSelectedSeason(null)}}>
                            {selectedSeason}
                        </Link>
                    </Breadcrumbs>
                )
            case "major":
            case "lcq":
            case "ti_main":
            case "region": // season, event
                return (
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("season"); setSelectedSeason(null)}}>
                            {selectedSeason}
                        </Link>
                        <Link underline="hover" color="inherit" onClick={() => {
                            if (selectedSeason == "TI")
                            {
                                setActiveSelection("ti")
                                setSelectedEvent(null)
                                return;
                            }
                            setActiveSelection("event")
                            setSelectedEvent(null)
                        }}>    
                            {selectedEvent}
                        </Link>
                    </Breadcrumbs>
                )
            case "division": // season, event, region
                return (
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("season"); setSelectedSeason(null)}}>
                            {selectedSeason}
                        </Link>
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("event"); setSelectedEvent(null)}}>
                            {selectedEvent}
                        </Link>
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("region"); setSelectedRegion(null)}}>
                            {selectedRegion}
                        </Link>
                    </Breadcrumbs>
                )
            case "div1":
            case "ti_region":
            case "qualifier": // season, event, region, division
                return (
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("season"); setSelectedSeason(null)}}>
                            {selectedSeason}
                        </Link>
                        <Link underline="hover" color="inherit" onClick={() => {
                            if (selectedSeason == "TI")
                            {
                                setActiveSelection("ti")
                                setSelectedEvent(null)
                                return;
                            }
                            setActiveSelection("event")
                            setSelectedEvent(null)
                        }}>
                            {selectedEvent}
                        </Link>
                        <Link underline="hover" color="inherit" onClick={() => {
                            setActiveSelection("region")
                            setSelectedRegion(null);    
                        }}>
                            {selectedRegion}
                        </Link>
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("division"); setSelectedDivision(null);}}>
                            {selectedDivision}
                        </Link>
                    </Breadcrumbs>
                )
            case "team": // season, event, region, division, qualifier
                return (
                    <Breadcrumbs aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("season"); setSelectedSeason(null)}}>
                            {selectedSeason}
                        </Link>
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("event"); setSelectedEvent(null)}}>
                            {selectedEvent}
                        </Link>
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("region"); setSelectedRegion(null)}}>
                            {selectedRegion}
                        </Link>
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("division"); setSelectedDivision(null)}}>
                            {selectedDivision}
                        </Link>
                        <Link underline="hover" color="inherit" onClick={() => {setActiveSelection("qualifier"); setSelectedQualifier(null)}}>
                            {selectedQualifier} 
                        </Link>
                    </Breadcrumbs>
                )

        }
    }

    const getSelection = () => {
        let afterSelection = null;
        let selectOptions = [];
        let setFunc = null;
        let startvalue = null;
        switch(activeSelection) {
            case "season":
                afterSelection = "event";
                selectOptions = seasons;
                setFunc = setSelectedSeason;
                startvalue = selectedSeason;
                break;
            case "event":
                afterSelection = "region";
                selectOptions = events;
                setFunc = setSelectedEvent;
                startvalue = selectedEvent;
                break;
            case "region":
                afterSelection = "division";
                selectOptions = regions;
                setFunc = setSelectedRegion;
                startvalue = selectedRegion;
                break;
            case "division":
                afterSelection = "qualifier";
                selectOptions = divisions;
                setFunc = setSelectedDivision;
                startvalue = selectedDivision;
                break;
            case "qualifier":
                afterSelection = "team";
                selectOptions = qualifiers;
                setFunc = setSelectedQualifier;
                startvalue = selectedQualifier;
                break;
            case "ti":
                selectOptions = ["Main Event", "Regional Qualifiers", "Last Chance Qualifiers"]
                afterSelection = "region"
                setFunc = setSelectedEvent;
                startvalue = selectedEvent;
                break;
            case "major":
                return;
            case "div1":
                return;
            case "lcq":
                return;
            case "ti_region":
                return;
            case "ti_main":
                return;
            case "team":
                return;
        }

        let targetFunc = (x) => {
            if (activeSelection === "season" && x === "TI") {
                setActiveSelection("ti");
                return setSelectedSeason("TI");
            }
            if(activeSelection === "event" && x === "major") {
                setActiveSelection("major");
                return setSelectedEvent("major");
            }
            if(activeSelection === "division" && x === "div1") {
                setActiveSelection("div1");
                return setSelectedDivision("div1");
            }
            if(selectedSeason == "TI" && x === "Last Chance Qualifiers") {
                setActiveSelection("lcq");
                return setSelectedEvent("Last Chance Qualifiers");
            }
            if(selectedSeason == "TI" && activeSelection === "region")
            {
                setActiveSelection("ti_region");
                return setSelectedRegion(x);
            }
            if(selectedSeason == "TI" && x === "Main Event")
            {
                setActiveSelection("ti_main");
                return setSelectedEvent("Main Event");
            }
            return setFunc(x);
        }
        

        return (
            <Grid container spacing={2} sx={{ width: "100%" }}>
                <Grid item xs={12}>
                    <Tabs
                        value={startvalue}
                        onChange={(event, newValue) => {
                            setActiveSelection(afterSelection);
                            targetFunc(newValue);
                        }}
                    >
                        {selectOptions.map((v) => (
                            <Tab label={v} value={v} key={v}/>
                        ))}
                    </Tabs>
                </Grid>
            </Grid>
        )
    }

    const getCompetition = () => {
        const notYetHappened = (
            <Typography variant="h4" component="div" gutterBottom>
                This event has not yet happened.
            </Typography>
        )
        if (selectedSeason === "TI") {
            //Select top 
            if(selectedEvent === "Main Event")
            {
                if(dpc.TI.regional_teams.length == 0)
                {
                    return notYetHappened;
                }
                return <Competition type="ti" invited = {dpc.TI.invited_teams} regional = {dpc.TI.regional_teams} lcq = {dpc.TI.lcq_teams} report={reportResults}/>
            }
            else if(selectedEvent == "Regional Qualifiers")
            {
                if(dpc.TI.regional.NA.teams.length == 0)
                {
                    return notYetHappened;
                }
                return <Competition type="double_elimination" teams = {dpc.TI.regional[selectedRegion].teams} report={reportResults}/>
            }
            else
            {
                if(dpc.TI.lcq_teams.length == 0)
                {
                    return notYetHappened;
                }
                return <Competition type="double_elimination" teams = {dpc.TI.lcq_teams} report={reportResults}/>
            }
        }
        else
        {
            if(selectedEvent === "major")
            {
                if(dpc[selectedSeason].major.teams.length == 0)
                {
                    return notYetHappened;
                }
                return <Competition type="double_elimination" teams = {dpc[selectedSeason].major.teams} report={reportResults}/>
            }
            else
            {
                if(selectedDivision === "div1")
                {
                    if(dpc[selectedSeason].div1[selectedRegion].teams.length == 0)
                    {
                        return notYetHappened;
                    }
                    return <Competition type="round_robin" teams = {dpc[selectedSeason].div1[selectedRegion].teams} report={reportResults}/>
                }
                else
                {
                    console.log("div2")
                    if(dpc[selectedSeason].div2[selectedRegion][selectedQualifier].teams.length == 0)
                    {
                        return notYetHappened;
                    }
                    return <Competition type="round_robin" teams = {dpc[selectedSeason].div2[selectedRegion][selectedQualifier].teams} report={reportResults}/>
                }
            }
        }
    }

    const givePoints = (points, team) => {
        //Find team in props.regionTeams
        team.points += points;
        for (let region in props.regionTeams)
        {
            for (let i = 0; i < props.regionTeams[region].length; i++)
            {
                if (props.regionTeams[region][i].name === team)
                {
                    props.regionTeams[region][i].points += points;
                    return;
                }
            }
        }
    }

    const reportResults = (season, event, region, division, qualifier, results) => {
        //Number of top teams that qualify to tournaments
        const regionTeamCount = {
            "WEU": 4,
            "EEU": 3,
            "CN": 4,
            "SEA": 3,
            "SA": 2,
            "NA": 2,
        }
        const majorPointAllocations = [
            400,
            350,
            300,
            250,
            200,
            200,
            100,
            100
        ]

        const div1PointAllocations = [
            300,
            180,
            120,
            60,
            30
        ]

        let newDpc = {...dpc};
        if (season == "TI")
        {

        }
        else
        {
            if (event == "major")
            {
                //Assign points to teams based on placement
                for (let i = 0; i < results.length; i++)
                {
                    givePoints(majorPointAllocations[i], results[i]);
                }
            }
            if (season != "season3")
            {
                //Top n teams from div1 qualify to major, bottom 2 to div2, top 2 of div2 to div1, bottom 2 of div2 to closed_qualifers

            }
        }
    }

    return (
        <>{props.regionTeams && (
            <Box sx={{ 
                display: 'flex', flexWrap: 'wrap', 
                alignItems: 'center', 
                p: 1, m: 1, 
                bgcolor: 'background.paper',
                height: "80vh",
                borderColor: "primary.light",
                flexDirection: "column"
            }}>
                <Stack>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottom: " 1px solid black",
                    mb: 2,
                }}>
                    {getBreadcrumbs()}
                    {getSelection()}
                </Box>
                {getSelection() == null && getCompetition()}
                </Stack>
            </Box>
        )}</>
    );
}

export default Tournament;