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

export default function Masyu() {
    const [board, setBoard] = React.useState([]);
    const [path, setPath] = React.useState([]);
    const [boardSize, setBoardSize] = React.useState(5);
    const [solutionPath, setSolutionPath] = React.useState([]);
    const [revealSolution, setRevealSolution] = React.useState(false);
    const [isSolved, setIsSolved] = React.useState(false);
    const [hints, setHints] = React.useState([]);

    useEffect(() => {
        setBoard(createBoard(5, 10));
        
    }, [])

    useEffect(() => {
        setBoard(createBoard(boardSize, boardSize * 2));
    }, [boardSize]);

    useEffect(() => {
        setRevealSolution(false);
        setPath([]);
    }, [solutionPath]);

    useEffect(() => {
        if (path.length > 0) {
            checkSolution();
        }
    }, [path]);

    const handleTileClick = (x, y) => {
        //If tile is already in path, remove it and all tiles after it
        if (path.some((tile) => tile.x === x && tile.y === y)) {
            
            let tileIndex = path.findIndex((tile) => tile.x === x && tile.y === y);
            console.log("Tile is in path at index " + tileIndex);
            let newPath = path.slice(0, tileIndex);
            console.log(newPath);
            setPath(newPath);
        }
        //If tile is not in path, add it to path
        else {
            // If tile is not adjacent to last tile in path, do nothing
            if (path.length > 0) {
                let lastTile = path[path.length - 1];
                if (Math.abs(lastTile.x - x) + Math.abs(lastTile.y - y) !== 1) {
                    return;
                }
            }
            setPath([...path, { x, y }]);
        }
    };


    //returns a circuit as a list of x,y pairs that passes through all points and returns to its starting points. 
    //If no such circuit exists, return null.
    //Using dfs
    const findCircuit = (boardSize, points) => {
        let board = [];
        for (let i = 0; i < boardSize; i++) {
            board.push([]);
            for (let j = 0; j < boardSize; j++) {
                board[i].push(0);
            }
        }

        let start = points[0];
        const dfs = (x, y, path, visited) => {
            //Base case
            if(visited.length == points.length && x == start.x && y == start.y)
            {
                return path;
            }

            //Iterate through all neighbors
            let neighbors = [];
            for(let i = -1; i <= 1; i++)
            {
                for(let j = -1; j <= 1; j++)
                {
                    if(Math.abs(i) + Math.abs(j) == 1)
                    {
                        let newX = x + i;
                        let newY = y + j;
                        if(newX >= 0 && newX < boardSize && newY >= 0 && newY < boardSize && board[newX][newY] == 0 && !path.some((tile) => tile.x === newX && tile.y === newY))
                        {
                            neighbors.push({x: newX, y: newY});
                        }
                    }
                }
            }
            //Sort neighbors by distance to any point
            neighbors.sort((a, b) => {
                let aDist = points.reduce((acc, point) => Math.min(acc, Math.abs(a.x - point.x) + Math.abs(a.y - point.y)), Infinity);
                let bDist = points.reduce((acc, point) => Math.min(acc, Math.abs(b.x - point.x) + Math.abs(b.y - point.y)), Infinity);
                return aDist - bDist;
            });

            //Explore neighbors from closest to furthest
            for(let i = 0; i < neighbors.length; i++)
            {
                let neighbor = neighbors[i];
                let newX = neighbor.x;
                let newY = neighbor.y;
                //Check if passed through a point
                for(let q = 0; q < points.length; q++)
                {
                    if(points[q].x == newX && points[q].y == newY)
                    {
                        visited.push({x: newX, y: newY});
                        break;
                    }
                }

                //Add point to path
                let newPath = dfs(newX, newY, [...path, {x: newX, y: newY}], [...visited]);
                if(newPath != null)
                {
                    return newPath;
                }
            }

            

            return null;
        }

        return dfs(start.x, start.y, [], []);
    }

    const createBoard = (boardSize) => {
        setIsSolved(false);
        //Create empty board of 0's
        let newBoard = [];
        for (let i = 0; i < boardSize; i++) {
            newBoard.push([]);
            for (let j = 0; j < boardSize; j++) {
                newBoard[i].push(0);
            }
        }

        //Create a list of points randomly on the grid
        let points = [];
        for(let i = 0;i < boardSize*2; i++)
        {
            let x = Math.floor(Math.random() * boardSize);
            let y = Math.floor(Math.random() * boardSize);
            while (points.some((point) => point.x === x && point.y === y)) {
                x = Math.floor(Math.random() * boardSize);
                y = Math.floor(Math.random() * boardSize);
            }
            points.push({x, y});
        }

        let path = findCircuit(boardSize, points);
        
        setSolutionPath(path);

        let circles = [];
        //White circles must be traveled straight through
        //Black circles must be turned upon
        //Add white and black circles (1,-1) where valid
        for (let i = 1; i < path.length-1; i++) {
            let tile = path[i];
            let nextTile = path[i + 1];
            let prevTile = path[i - 1];

            //If tile is a straight path, it must be a white circle
            if (tile.x === prevTile.x && tile.x === nextTile.x || tile.y === prevTile.y && tile.y === nextTile.y) {
                if(i % 3 == 0)
                {
                    newBoard[tile.x][tile.y] = 1;
                    circles.push({x: tile.x, y: tile.y, color: 1});
                }
            }
            //If tile is a turn, it must be a black circle
            else {
                if(i % 3 == 0)
                {
                    newBoard[tile.x][tile.y] = -1;
                    circles.push({x: tile.x, y: tile.y, color: -1});
                }
            }
        }
        setHints(circles);

        return newBoard;
    }

    const handleBoardSize = (event, newBoardSize) => {
        if (newBoardSize !== null) {
            setBoardSize(newBoardSize);
        }
    }

    const clearSolution = () => {
        setPath([]);
    }

    const handleRevealSolution = () => {
        setPath(solutionPath);
        setRevealSolution(true);
    }

    const getPathGraphic = (path, x, y) => {
        //Get index of point in path
        let index = path.findIndex((tile) => tile.x === x && tile.y === y);

        //Get previous point in path
        let prevTile = null;
        if (index > 0)
        {
            prevTile = path[index - 1];
        }

        //Get next point in path
        let nextTile = null;
        if (index < path.length - 1)
        {
            nextTile = path[index + 1];
        }

        if(prevTile == null && path.length > 2)
        {
            //Check if the last tile in the path is adjacent to this point (distance == 1)
            if(Math.abs(path[path.length - 1].x  - x) + Math.abs(path[path.length - 1].y - y) == 1) 
            {
                prevTile = path[path.length - 1];
            }
        }
        if(nextTile == null && path.length > 2)
        {
            //Check if the first tile in the path is adjacent to this point
            if(Math.abs(path[0].x  - x) + Math.abs(path[0].y - y) == 1)
            {
                nextTile = path[0];
            }
        }

        //Return the appropiate clip-path property to draw the line
        //This is the first path, draw a circle
        if(nextTile == null && prevTile == null)
        {   
            return "circle(15% at 50% 50%)";
        }

        //This it the first tile in the circuit
        if(prevTile == null && nextTile != null)
        {
            if (nextTile.x === x)
            {
                if(nextTile.y > y)
                {
                    return "polygon(50% 45%, 100% 45%, 100% 55%, 50% 55%)"; //middle to right
                }
                else
                {
                    return "polygon(50% 45%, 0% 45%, 0% 55%, 50% 55%)"; //middle to left
                }
            }
            else if (nextTile.y === y)
            {
                if(nextTile.x > x)
                {
                    return "polygon(45% 100%, 45% 50%, 55% 50%, 55% 100%)"; //middle to bottom
                }
                else
                {
                    return "polygon(45% 50%, 45% 0%, 55% 0%, 55% 50%)"; // middle to top
                }
            }
        }

        //If the next tile is null, the path ends in the current tile so draw a half line
        if (prevTile != null && nextTile == null)
        {
            if (prevTile.x === x)
            {
                if(prevTile.y > y)
                {
                    return "polygon(100% 45%, 50% 45%, 50% 55%, 100% 55%)"; //(right to middle)
                }
                else
                {
                    return "polygon(0% 45%, 50% 45%, 50% 55%, 0% 55%)"; //(left to middle)
                }
            }
            else if (prevTile.y === y)
            {
                if(prevTile.x > x)
                {
                    return "polygon(45% 100%, 45% 50%, 55% 50%, 55% 100%)"; //(bottom to middle)
                }
                else
                {
                    return "polygon(45% 0%, 55% 0%, 55% 50%, 45% 50%)"; //(top to middle)
                }
            }
        }

        //Draw either a straight line, or a bent line
        if(prevTile != null && nextTile != null)
        {
            if (prevTile.x === nextTile.x)
            {
                //Straight line
                return "polygon(0% 45%, 100% 45%, 100% 55%, 0% 55%)";
            }
            else if(prevTile.y === nextTile.y)
            {
                //Straight line
                return "polygon(45% 0%, 55% 0%, 55% 100%, 45% 100%)";
            }
            //Bottom to right
            else if(prevTile.x > nextTile.x && prevTile.y < nextTile.y && x < prevTile.x)
            {
                return "polygon(45% 100%, 45% 45%, 100% 45%, 100% 55%, 55% 55%, 55% 100%)";
            }
            //Bottom to left
            else if(prevTile.x > nextTile.x && prevTile.y > nextTile.y && x < prevTile.x)
            {
                return "polygon(45% 100%, 45% 55%, 0% 55%, 0% 45%, 55% 45%, 55% 100%)";
            }
            //left to top
            else if(prevTile.x > nextTile.x && prevTile.y < nextTile.y && y > prevTile.y)
            {
                return "polygon(0% 45%, 45% 45%, 45% 0%, 55% 0%, 55% 55%, 0% 55%)";
            }
            //left to bottom
            else if(prevTile.x < nextTile.x && prevTile.y < nextTile.y && y > prevTile.y)
            {
                return "polygon(45% 100%, 45% 55%, 0% 55%, 0% 45%, 55% 45%, 55% 100%)";
            }
            //right to top
            else if(prevTile.x > nextTile.x && prevTile.y > nextTile.y && y < prevTile.y)
            {
                return "polygon(100% 45%, 100% 55%, 45% 55%, 45% 0%, 55% 0%, 55% 45%)";
            }
            //right to bottom
            else if(prevTile.x < nextTile.x && prevTile.y > nextTile.y && y < prevTile.y)
            {
                return "polygon(100% 45%, 100% 55%, 55% 55%, 55% 100%, 45% 100%, 45% 45%)";
            }
            //top to left
            else if(prevTile.x < nextTile.x && prevTile.y > nextTile.y && x > prevTile.x)
            {
                return "polygon(0% 45%, 45% 45%, 45% 0%, 55% 0%, 55% 55%, 0% 55%)";
            }
            //top to right
            else if(prevTile.x < nextTile.x && prevTile.y < nextTile.y && x > prevTile.x)
            {
                return "polygon(45% 0%, 45% 55%, 100% 55%, 100% 45%, 55% 45%, 55% 0%)";
            }
            else
            {
                console.log("Shouldn't happen")
            }
        }
    }

    const checkSolution = () => {
        //Check if all hints are satisfied by the path (white circles must be traveled through straight, black circles must have bend)
        
        for (let i = 0; i < hints.length; i++)
        {
            const hint = hints[i];
            if (hint.color == 1)
            {
                //Check if the tile is on the path
                if (!path.some(tile => tile.x === hint.x && tile.y === hint.y))
                {
                    return false;
                }
                let index = path.findIndex(tile => tile.x === hint.x && tile.y === hint.y);
                let prevTile = index > 0 ? path[index - 1] : null;
                let nextTile = index < path.length - 1 ? path[index + 1] : null;
                //Check if the tile is straight
                if (prevTile != null && nextTile != null)
                {
                    if (prevTile.x !== nextTile.x && prevTile.y !== nextTile.y)
                    {
                        return false;
                    }
                }
            }
            else
            {
                //Check if the tile is on the path
                if (!path.some(tile => tile.x === hint.x && tile.y === hint.y))
                {
                    return false;
                }
                let index = path.findIndex(tile => tile.x === hint.x && tile.y === hint.y);
                let prevTile = index > 0 ? path[index - 1] : null;
                let nextTile = index < path.length - 1 ? path[index + 1] : null;
                //Check if the tile is bent
                if (prevTile != null && nextTile != null)
                {
                    if (prevTile.x === nextTile.x || prevTile.y === nextTile.y)
                    {
                        return false;
                    }
                }
            }
        }

        //Check if the path is continuous
        //If the last point in the path is adjacent to the start point it counts as continuos
        if(Math.abs(path[path.length - 1].x - path[0].x) + Math.abs(path[path.length - 1].y - path[0].y) > 1)
        {
            return false;
        }

        setIsSolved(true);
    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            <Navbar/>

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 1, bgcolor: 'background.paper', width: "100%" }}>
                Draw a path starting and ending in the same spot that passes through all of the circles. The white circles must be passed through straight, and the black circles must be passed through with a bend.
            </Box>

            <Box sx={{ width: "700px" }}>
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
                        value={boardSize}
                        exclusive
                        onChange={handleBoardSize}
                        aria-label="grid size"
                        
                    >
                        <ToggleButton value={5} aria-label="5x5">
                            5x5
                        </ToggleButton>
                        <ToggleButton value={6} aria-label="10x10">
                            6x6
                        </ToggleButton>
                        <ToggleButton value={7} aria-label="15x15">
                            7x7
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {/*Board*/}
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 1, bgcolor: "background.paper", width: "100%" }}>
                    <Grid container spacing={1}>
                        {board.map((row, i) => (
                            <Grid item xs={12} key={i}>
                                <Grid container justifyContent="center" spacing={1}>
                                    {row.map((col, j) => (
                                        <Grid key={j} item>
                                            <Paper sx={{ 
                                                width: "50px", 
                                                height: "50px", 
                                                display: "flex", 
                                                justifyContent: "center", 
                                                alignItems: "center",
                                                '&:hover': {
                                                    boxShadow: 3,
                                                }
                                            }}
                                                onClick={() => handleTileClick(i, j)}
                                            >
                                                {/* 1 draw white circle, -1 draw black circle, 0 draw empty */}
                                                {col === 1 && <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "white", border: "1px solid black" }}></div>}
                                                {col === -1 && <div style={{ width: "30px", height: "30px", borderRadius: "50%", backgroundColor: "black" }}></div>}
                                                {/* If the tile is in the solution path, draw a line */}
                                                {path.findIndex((tile) => tile.x === i && tile.y === j) !== -1 && 
                                                    <div style=
                                                        {{ 
                                                            width: "50px", 
                                                            height: "50px", 
                                                            position: "absolute", 
                                                            clipPath: getPathGraphic(path, i, j), 
                                                            backgroundColor: "red" 
                                                        }}
                                                    >

                                                    </div>
                                                }
                                            </Paper>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/*Bottom bar*/}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, m: 1, bgcolor: 'background.paper', width: '100%' }}>
                    
                    <Button variant="contained" onClick={() => {setBoard(createBoard(boardSize))}}>Regenerate</Button>
                    <Button variant="contained" onClick={clearSolution}>Clear</Button>
                    {revealSolution ? 
                        <Button variant="contained" onClick={()=>{setBoard(createBoard(boardSize))}}>
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
                        <Button variant="contained" onClick={()=>{setBoard(createBoard(boardSize))}}>
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
