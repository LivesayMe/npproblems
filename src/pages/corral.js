import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Tooltip } from '@mui/material';
import Navbar from '../navbar';



export default function Corral() {
    const [grid, setGrid] = React.useState([]);
    const [attempt, setAttempt] = React.useState([]);
    const [solution, setSolution] = React.useState([]);
    const [hints, setHints] = React.useState([]);
    const [revealSolution, setRevealSolution] = React.useState(false);
    const [gridSize, setGridSize] = React.useState(5);
    const [tileHighlight, setTileHighlight] = React.useState(null);
    const [isSolved, setIsSolved] = React.useState(false);

    useEffect(() => {
        createGrid(5, 4);
    }, []);

    useEffect(() => {
        checkSolution();
    }, [attempt])

    const createGrid = (gridSize, numHints) => {
        setRevealSolution(false);
        setIsSolved(false);
        setTileHighlight(null);

        //Create a gridSize x gridSize grid
        let grid = [];
        for (let i = 0; i < gridSize; i++) {
            grid.push([]);
            for (let j = 0; j < gridSize; j++) {
                grid[i].push(0);
            }
        }

        //Create a random contiguos blob of 1s
        let blob = []
        let frontier = []
        //Blob size is a random number between 1/2 and 3/4 of the grid size
        const gridArea = gridSize * gridSize;
        const blobSize = Math.floor(Math.random() * (gridArea * 3 / 4 - gridArea / 2) + gridArea / 2);
        let curX = Math.floor(Math.random() * gridSize);
        let curY = Math.floor(Math.random() * gridSize);
        blob.push([curX, curY]);
        if (curX + 1 < gridSize) frontier.push([curX+1, curY]);
        if (curX - 1 >= 0) frontier.push([curX-1, curY]);
        if (curY + 1 < gridSize) frontier.push([curX, curY+1]);
        if (curY - 1 >= 0) frontier.push([curX, curY-1]);
        const startX = curX;
        const startY = curY;
        let n = 4;
        while (blob.length < blobSize)
        {
            //Pick n random frontier points, and add the one furthest from the start
            
            let curX = 0;
            let curY = 0;
            let furthestDist = 0;
            let selected = 0;
            for (let i = 0; i < n; i++)
            {
                let rand = Math.floor(Math.random() * frontier.length);
                let dist = Math.sqrt(Math.pow(frontier[rand][0] - startX, 2) + Math.pow(frontier[rand][1] - startY, 2));
                if (dist > furthestDist)
                {
                    selected = rand;
                    furthestDist = dist;
                    curX = frontier[rand][0];
                    curY = frontier[rand][1];
                }
            }

            //Add the point to the blob
            blob.push([curX, curY]);
            
            //Add the neighbors to the frontier
            if (curX + 1 < gridSize && !blob.includes([curX+1, curY]) && !frontier.includes([curX+1, curY])) frontier.push([curX+1, curY]);
            if (curX - 1 >= 0 && !blob.includes([curX-1, curY]) && !frontier.includes([curX-1, curY])) frontier.push([curX-1, curY]);
            if (curY + 1 < gridSize && !blob.includes([curX, curY+1]) && !frontier.includes([curX, curY+1])) frontier.push([curX, curY+1]);
            if (curY - 1 >= 0 && !blob.includes([curX, curY-1]) && !frontier.includes([curX, curY-1])) frontier.push([curX, curY-1]);

            //Remove the frontier from the frontier list
            frontier.splice(selected, 1);

            //Check if the frontier is empty
            if (frontier.length === 0)
                break;
        }

        if (blob.length < numHints)
        {
            console.log("Not enough space for hints");
            return;
        }

        //Create the solution grid
        let solution = []
        for (let i = 0; i < grid.length; i++) {
            solution.push([]);
            for (let j = 0; j < grid.length; j++) {
                solution[i].push(0);
            }
        }
        for(let i = 0; i < blob.length; i++)
        {
            let x = blob[i][0];
            let y = blob[i][1];
            solution[x][y] = 1;
        }


        //Add hints to the grid
        let thints = []
        for (let i = 0; i < numHints; i++)
        {
            let rand = Math.floor(Math.random() * blob.length);
            let x = blob[rand][0];
            let y = blob[rand][1];
            thints.push([x, y]);
            blob.splice(rand, 1);
        }

        //Set the hint on the grid equal to the number of tiles visible from that tile in all orthogonal directions
        for (let i = 0; i < thints.length; i++)
        {
            let x = thints[i][0];
            let y = thints[i][1];
            grid[x][y] = getCanSee(grid, solution, x, y);
        }

        //Create the attempt grid (all 0s)
        let attempt = []
        for (let i = 0; i < grid.length; i++) {
            attempt.push([]);
            for (let j = 0; j < grid.length; j++) {
                attempt[i].push(0);
            }
        }

        setGrid(grid);
        setSolution(solution);
        setAttempt(attempt);
        setHints(thints);

    }

    const clearSolution = () => {
        //Clear the attempt grid
        let attempt = []
        for (let i = 0; i < grid.length; i++) {
            attempt.push([]);
            for (let j = 0; j < grid.length; j++) {
                attempt[i].push(0);
            }
        }
        setAttempt(attempt);
    }

    const getCanSee = (grid, solution, x, y) => {
        //Returns the number of tiles visible from the given tile in all orthogonal directions
        let canSee = 0;
        let curX = x;
        let curY = y;

        //Check up
        while (curY > 0)
        {
            curY--;
            if (solution[curX][curY] === 1)
                canSee++;
            else
                break;
        }

        //Check down
        curX = x;
        curY = y;
        while (curY < grid.length - 1)
        {
            curY++;
            if (solution[curX][curY] === 1)
                canSee++;
            else
                break;
        }

        //Check left
        curX = x;
        curY = y;
        while (curX > 0)
        {
            curX--;
            if (solution[curX][curY] === 1)
                canSee++;
            else
                break;
        }

        //Check right
        curX = x;
        curY = y;
        while (curX < grid.length - 1)
        {
            curX++;
            if (solution[curX][curY] === 1)
                canSee++;
            else
                break;
        }
        
        if(solution[x][y] === 1)
            canSee++; //Add 1 for the tile itself

        return canSee;
    }

    const checkSolution = () => {
        let allZeroes = true;
        for(let i = 0; i < grid.length; i++)
        {
            for(let j = 0;j < grid.length; j++)
            {
                if (attempt[i][j] !== 0)
                {
                    allZeroes = false;
                    break;
                }
            }
        }
        if (allZeroes)
        {
            return false;
        }

        //Check if the attempt grid satisfies the hints
        for (let i = 0; i < hints.length; i++)
        {
            let x = hints[i][0];
            let y = hints[i][1];
            if (grid[x][y] !== getCanSee(grid, attempt, x, y))
            {
                console.log("Hint at " + x + ", " + y + " is unsatisfied\n Expected " + grid[x][y] + " but got " + getCanSee(grid, attempt, x, y));
                return false;
            }
        }
        setIsSolved(true);
        return true;
    }

    const handleGridSize = (event, newGridSize) => {
        //Change the grid size
        setGridSize(newGridSize);
        let newNumHints = Math.floor(newGridSize * newGridSize * .1);
        createGrid(newGridSize, newNumHints);
    }

    const handleRevealSolution = () => {
        //Reveal the solution
        setAttempt(solution);
        setRevealSolution(true);
    }

    const handleHighlight = (x, y, highlightState) => {
        //Highlight the tile at the given coordinates
        if (tileHighlight != null && tileHighlight[0] === x && tileHighlight[1] === y)
            setTileHighlight(null);
        else
            setTileHighlight([x,y]);
    }

    const handleTileClick = (x, y) => {
        if(isSolved)
            return;
        //Deep copy the attempt grid
        let newAttempt = JSON.parse(JSON.stringify(attempt));
        if (newAttempt[x][y] === 0)
            newAttempt[x][y] = 1;
        else
            newAttempt[x][y] = 0;
        
        //Update the attempt grid, and check if the solution is correct after the change
        setAttempt(newAttempt);
        

    }

    const getBorders = (x, y) => {
        //Returns the borders of the tile at the given coordinates, as an object
        let borders = {
            borderLeft: "none",
            borderRight: "none",
            borderTop: "none",
            borderBottom: "none"
        }
        if (attempt[x][y] === 0) //If the tile is a wall, return dashed borders
        {
            borders.borderLeft = "1px dashed black";
            borders.borderRight = "1px dashed black";
            borders.borderTop = "1px dashed black";
            borders.borderBottom = "1px dashed black";
            return borders;
        }
        
        if (x === 0 || (x > 0 && attempt[x-1][y] === 0)) //Has a border on the top
            borders.borderTop = "2px solid black";
        if (x === grid.length - 1 || (x < grid.length - 1 && attempt[x+1][y] === 0)) //Has a border on the bottom
            borders.borderBottom = "2px solid black";
        if (y === 0 || (y > 0 && attempt[x][y-1] === 0)) //Has a border on the left
            borders.borderLeft = "2px solid black";
        if (y === grid.length - 1 || (y < grid.length - 1 && attempt[x][y+1] === 0)) //Has a border on the right
            borders.borderRight = "2px solid black";
        return borders;
            
    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            <Navbar/>

            <Box sx={{ width: "700px" }}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 1, bgcolor: 'background.paper', width: "100%" }}>
                Build a shape on the box such that every number can see that many tiles in each orthogonal direction.
            </Box>
                
                {/*Top setting bar*/}
                <Box sx=
                    {{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        p: 1, 
                        m: 1, 
                        bgcolor: 'background.paper',
                        width: '100%'
                    }}
                >
                    <ToggleButtonGroup
                        value={gridSize}
                        exclusive
                        onChange={handleGridSize}
                        aria-label="grid size"
                        
                    >
                        <ToggleButton value={5} aria-label="5x5">
                            5x5
                        </ToggleButton>
                        <ToggleButton value={7} aria-label="10x10">
                            7x7
                        </ToggleButton>
                        <ToggleButton value={10} aria-label="15x15">
                            10x10
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/*Grid Container*/}
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, m: 1, bgcolor: 'background.paper', width: '100%' }}>
                    <Grid container spacing={1}>
                        {grid.map((row, i) => (
                            <Grid item xs={12} key={i}>
                                <Grid container justifyContent="center" spacing={1}>
                                    {row.map((col, j) => (
                                        <Grid item key={j} sx={{
                                            width: 50,
                                            height: 50,
                                            borderLeft: getBorders(i, j).borderLeft,
                                            borderRight: getBorders(i, j).borderRight,
                                            borderTop: getBorders(i, j).borderTop,
                                            borderBottom: getBorders(i, j).borderBottom,
                                            backgroundColor: (attempt[i][j] === 1 || (tileHighlight != null && tileHighlight[0] == i && tileHighlight[1] == j)) ? "rgba(128,128,128,.5)" : "white",
                                            
                                        }}
                                        onClick={() => {
                                            handleTileClick(i, j);
                                        }}
                                        onMouseEnter={() => {
                                            //Highlight the current tile
                                            handleHighlight(i, j, 1);
                                            
                                        }}
                                        onMouseLeave={() => {
                                            //Unhighlight the current tile
                                            handleHighlight(i, j, 0);
                                        }}
                                        >
                                            {grid[i][j] != 0 &&
                                                
                                                <Tooltip title={getCanSee(grid, attempt, i, j)} arrow>
                                                    <Typography variant="h6" component="div" sx={{ 
                                                    textAlign: 'center', 
                                                    userSelect: "none",
                                                    color: (grid[i][j] == getCanSee(grid, attempt, i, j) ? "green": "red")}}>
                                                    
                                                    {grid[i][j]}
                                                </Typography>
                                                </Tooltip>
                                                
                                            }
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                

                {/*Bottom bar*/}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, m: 1, bgcolor: 'background.paper', width: '100%' }}>
                    
                    <Button variant="contained" onClick={() => {createGrid(gridSize, gridSize)}}>Regenerate</Button>
                    <Button variant="contained" onClick={clearSolution}>Clear</Button>
                    {revealSolution ? 
                        <Button variant="contained" onClick={()=>{createGrid(gridSize, gridSize)}}>
                            Replay
                        </Button>
                    :
                        <Button variant="contained" onClick={handleRevealSolution}>Reveal Solution</Button>
                    }
                </Box>

                {/* Celebration Panel */}
                {(isSolved) &&
                <>{!revealSolution &&
                <Box sx={{position: "absolute", top: "0", left: "0", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,.5)", visibility: isSolved ? "visible" : "hidden"}}>
                    <Box sx={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "white", borderRadius: "10px", padding: "20px"}}>
                        <Typography variant="h4" component="div" sx={{ textAlign: 'center', userSelect: "none"}}>
                            Congratulations!
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ textAlign: 'center', userSelect: "none"}}>
                            You solved the puzzle!
                        </Typography>
                        <Button variant="contained" onClick={()=>{createGrid(gridSize, gridSize)}}>
                            Play Again
                        </Button>
                    </Box>
                </Box>
                }
                </>
                }
            </Box>
        </Box>
    )
}
