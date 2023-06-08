import React, { useEffect } from 'react';
import { Box, Grid, Tabs, Typography, Tab, List, ListItem, ListItemText } from '@mui/material';
import Overview from './DPC/overview';
import Tournament from './DPC/tournament';

function DPC(props) {
    const regions = "NA WEU EEU SEA SA CN".split(" ");
    const [regionTeams, setRegionTeams] = React.useState(null);
    const [selectedPage, setSelectedPage] = React.useState(0);

    useEffect(() => {
        if (regionTeams == null)
        {
            let generated = populateWorld();
            setRegionTeams(generated);
        }
    }, []);

    const randomTeamName = () => {
        const prefixes = ["Cyber", "Digital", "Electric", "Pixel", "Storm", "Vicious", "Rage", "Thunder", "Fire", "Ice", "Atomic", "Phoenix", "Shadow", "Savage", "Neon"]
        const affixes = ["Knights", "Empire", "Demons", "Brigade", "Surge", "Rockets", "Pioneers", "Assault", "Hunters", "Warriors", "Vipers", "Storm", "Dragons", "Titans", "Wolves"]
        
        let prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        let affix = affixes[Math.floor(Math.random() * affixes.length)];

        return prefix + " " + affix;
    }

    const populateWorld = () => {
        //Each region has 2 divisions. Each division has 8 teams. Division 2 also has 8 teams in closed qualifiers, and 8 in open qualifiers.
        let used_names = [];
        let world = {};
        for (let region of regions) {
            
            let region_teams = {
                div1: [],
                div2: {
                    main: [],
                    closed_qual: [],
                    open_qual: []
                }
            }
            //Generate 32 teams and sort by elo
            let teams = [];
            for (let i = 0; i < 32; i++) {
                let t = randomTeam(used_names, region, 1);
                used_names.push(t.name);
                teams.push(t);
            }
            teams.sort((a, b) => b.elo - a.elo);
            //Assign 8 teams to each division
            region_teams.div1 = teams.slice(0, 8);
            region_teams.div2.main = teams.slice(8, 16);
            region_teams.div2.closed_qual = teams.slice(16, 24);
            region_teams.div2.open_qual = teams.slice(24, 32);


            world[region] = region_teams;
        }

        return world;
    }

    const randomTeam = (used_names, region, division, qualifier=null) => {
        //Normally distributed number with mean 1000, std 100
        let trueElo = normalRandom(1000, 100);
        let elo = normalRandom(trueElo, 100);
        let base_name = randomTeamName();
        let i = 1;
        let name = base_name;
        while (used_names.includes(name)) {
            //Append letter to name if name is already taken
            name = base_name + " " + String.fromCharCode(65 + i);
            i++;
        }
        let uuidv4 = require('uuid').v4;
        let id = uuidv4();

        return {
            name: name,
            elo: elo,
            trueElo: trueElo,
            wins: 0,
            losses: 0,
            draws: 0,
            points: 0,
            region: region,
            division: division,
            qualifier: null,
            id: id
        }
    }

    const normalRandom = (mu, sigma) => {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * sigma + mu;
    }

    const getAllTeams = (sort = false) => {
        let teams = [];
        for (let region of regions) {
            teams = teams.concat(regionTeams[region].div1);
            teams = teams.concat(regionTeams[region].div2.main);
            teams = teams.concat(regionTeams[region].div2.closed_qual);
            teams = teams.concat(regionTeams[region].div2.open_qual);
        }
        //Sort first by points then by elo
        if (sort) {
            teams.sort((a, b) => {
                if (a.points == b.points) {
                    return b.elo - a.elo;
                }
                return b.points - a.points;
            });
        }
        return teams;
    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            {/* Top Nav bar, primary color */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, m: 0, bgcolor: "primary.main", width: "100%" }}>
                <a href={"/"} style={{textDecoration: "none"}}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Home
                    </Typography>
                </a>
            </Box>
            <Tabs value={selectedPage} onChange={(e, v) => setSelectedPage(v)} aria-label="page tabs">
                <Tab label="Overview" value = {0} />
                <Tab label="Tournaments" value = {1} />
            </Tabs>
            {selectedPage == 0 && (
            <Overview regionTeams={regionTeams} getAllTeams={getAllTeams} regions={regions} />
            )}
            {selectedPage == 1 && (
                <Tournament regionTeams={regionTeams} getAllTeams={getAllTeams} regions={regions} />
            )}
        </Box>
    );
}

export default DPC;