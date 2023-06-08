import React, { useEffect } from 'react';
import { Box, Grid, Tabs, Typography, Tab, List, ListItem, ListItemText, TextField, Breadcrumbs, Link, Button } from '@mui/material';

function Competition(props) {
    const [matches, setMatches] = React.useState({});
    const [played, setPlayed] = React.useState([]);
    const [simulate, setSimulate] = React.useState(false);
    const [rendered, setRendered] = React.useState(false);

    useEffect(() => {
        setRendered(round_robin(props.teams, simulate));
    }, [simulate]);

    const evaluateMatch = (team1, team2) => {
        let winProb = 1 / (1 + Math.pow(10, (team2.trueElo - team1.trueElo) / 400));
        let win = Math.random() < winProb;
        return win;
    }

    const playMatch = (team1, team2) => {
        if (evaluateMatch(team1, team2))
        {
            if(evaluateMatch(team1, team2))
            {
                return [true, "2-1"]
            }
            else
            {
                if(evaluateMatch(team1, team2))
                {
                    return [true, "2-1"]
                }
                else
                {
                    return [false, "1-2"]
                }
            }
        }
        else
        {
            if(evaluateMatch(team1, team2))
            {
                if(evaluateMatch(team1, team2))
                {
                    return [true, "2-1"]
                }
                else
                {
                    return [false, "1-2"]
                }
            }
            else
            {
                return [false, "0-2"]
            }
        }
    }

    const round_robin = (teams, simulate=false) => {
        let c_matches = {}
        //Render table
        let table = [];
        let c_played = [];
        for (let i = 0; i < teams.length; i++) {
            let row = [];
            for (let j = 0; j < teams.length; j++) {
                if (i == j || !simulate) {
                    row.push("X");
                }
                else {
                    //Check if the match has already been played
                    if ((teams[i].name+ "," + teams[j].name) in c_matches || (teams[j].name + "," + teams[i].name) in c_matches) {
                        if(teams[j].name + "," + teams[i].name in c_matches)
                        {
                            row.push(c_matches[teams[j].name + "," + teams[i].name]);
                        }
                        else
                        {
                            //Reverse the result
                            let result = c_matches[teams[i].name + "," + teams[j].name];
                            let reversed = result.slice();
                            reversed[0] = !reversed[0];
                            reversed[1] = reversed[1].split("-").reverse().join("-");
                            row.push(reversed);
                        }
                    }
                    else
                    {
                        let result = playMatch(teams[i], teams[j]);
                        c_played.push([teams[i].name, teams[j].name, result[0]]);
                        row.push(result);
                        c_matches[teams[i].name + "," + teams[j].name] = result
                    }
                }
            }
            table.push(row);
        }
        setPlayed(c_played);
        setMatches(c_matches);

        //Render results
        return (
            <Box>
                <Grid container>
                    <Grid item xs={1}></Grid>
                    {teams.map((team) => (
                        <Grid item xs={1} sx={{
                            border: 1,
                            textAlign: "center",
                        }}>
                            <Typography variant="h6">{team.name}</Typography>
                        </Grid>
                    ))}
                </Grid>
                {table.map((row, i) => (
                    <Grid container>
                        <Grid item xs={1} sx={{
                            border: 1,
                            textAlign: "center",
                        }}>
                            <Typography variant="h6">{teams[i].name}</Typography>
                        </Grid>
                        {row.map((col) => (
                            <Grid item xs={1} sx={{
                                bgcolor: col[0] == "X" ? "grey" : (col[0] ? "success.light" : "error.light"),
                                justifyContent: "center",
                                alignItems: "center",
                                display: "flex",
                                border: 1,
                            }}>
                                <Typography variant="h6">
                                    {/* Show a X if team 1 won and a 0 otherwise */}
                                    {col[1]}
                                </Typography>
                            </Grid>
                        ))}
                    </Grid>
                ))}
            </Box>
        )
    }

    const getStandings = (teams) => {
        //Find how many times each team has won
        let wins = {};
        let losses = {};
        for (let i = 0; i < teams.length; i++) {
            wins[teams[i].name] = 0;
            losses[teams[i].name] = 0;
        }

        //Iterate through all the played matches
        for (let i = 0; i < played.length; i++) {
            if (played[i][2]) {
                wins[played[i][0]] += 1;
                losses[played[i][1]] += 1;
            }
            else {
                wins[played[i][1]] += 1;
                losses[played[i][0]] += 1;
            }
        }

        //Sort the teams by wins and add the wins to the team object
        let sorted = teams.sort((a, b) => wins[b.name] - wins[a.name]);
        for (let i = 0; i < sorted.length; i++) {
            sorted[i].wins = wins[sorted[i].name];
            sorted[i].losses = losses[sorted[i].name];
        }
        return sorted;
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-evenly",
                alignItems: "center",
                width: "100%",
                height: "100%",
            }}>
                <List sx={{
                    border: 1,
                    borderColor: "primary.light",
                    mr: 4,
                }}>
                    {props.teams.map((team) => (
                        <ListItem key={team.id}>
                            <ListItemText primary={team.name} secondary={Math.round(team.elo, 5)} />
                        </ListItem>
                    ))}
                </List>
                {rendered}

                <List sx={{
                    border: 1,
                    borderColor: "primary.light",
                    ml: 4,
                }}>
                    {simulate && <>{getStandings(props.teams).map((team) => {
                        return (
                        <ListItem key={team.id}>
                            <ListItemText primary={team.name} secondary={team.wins +"-" + team.losses} />
                        </ListItem>
                    )})}</>}
                </List>
            </Box>
            <Button 
                variant="contained"
                sx={{
                    mt: 2,
                }}
                onClick={() => setSimulate(!simulate)}
            >Simulate Games</Button>
        </Box>
    );
}

export default Competition;