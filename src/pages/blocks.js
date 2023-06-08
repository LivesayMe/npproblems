import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Draggable, {DraggableCore} from 'react-draggable';
import Navbar from '../navbar';

function Blocks(props) {
    const [availableBlocks, setAvailableBlocks] = React.useState([]);
    const [grid, setGrid] = React.useState([]);
    const [points, setPoints] = React.useState(0);
    const [gameOver, setGameOver] = React.useState(false);
    const [blockStates, setBlockStates] = React.useState([true, true, true]); //Stores whether or not a block can be placed
    const [blockDefaultPositions, setBlockDefaultPositions] = React.useState([]); //Stores the default position of each block
    const [blockPositions, setBlockPositions] = React.useState([{x:0,y:0}, {x:0,y:0}, {x:0,y:0}]); //Stores the current position of each block
    const [blockPlaced, setBlockPlaced] = React.useState([false, false, false]); //Stores whether or not a block has been placed
    const [highlights, setHighlights] = React.useState([]); //Stores the highlights for each block


    React.useEffect(() => {
        //Set to 8x8 grid of 0's
        console.log("Page loaded")
        resetGrid();
        setAvailableBlocks(getBlocks(3));
    }, []);

    React.useEffect(() => {
        checkBoard();
    }, [grid]);

    const reset = () => {
        setAvailableBlocks(getBlocks(3));
        resetGrid();
        setPoints(0);
        setGameOver(false);
        setBlockStates([true, true, true]);
        setBlockPlaced([false, false, false]);
    }

    const resetGrid = () => {
        //Set to 8x8 grid of 0's
        let grid = [];
        for (let i = 0; i < 8; i++) {
            let row = [];
            for (let j = 0; j < 8; j++) {
                row.push(0);
            }
            grid.push(row);
        }
        setGrid(grid);
    }

    const validBlocks = [
        [
            [1,1], //XX
            [1,1]  //XX
        ],
        [
            [1,1,1], //XXX
            [1,0,0]  // X 
        ],
        [
            [1,1,1], //XXX
            [0,0,1]  //  X
        ],
        [ 
            [1,1,1], //XXX
            [0,1,0]  // X
        ],
        [
            [1,1,0], //XX
            [0,1,1]  // XX  
        ],
        [
            [0,1,1], // XX
            [1,1,0]  //XX
        ],
        [
            [1,0,1], //X X
            [1,1,1]  //XXX
        ],
        [
            [1,0,1], //X X
            [0,1,0], // X 
            [1,0,1], //X X
        ],
        [
            [1,0], //X
            [0,1], // X
        ],
        [
            [1], //X
        ],
        [
            [1,1], //XX
            [0,1]  // X
        ],
        [
            [1], //X
            [1], //X
        ],
        [
            [1,0,0], //X
            [1,1,1]  //XXX
        ],
        [
            [0,0,1], //  X
            [1,1,1]  //XXX
        ],
        [
            [0,1,0], // X
            [1,1,1]  //XXX
        ],
        [
            [1], //X
            [1], //X
            [1], //X
            [1]  //X
        ],
        [
            [1,1,1,1] //XXXX
        ],
        [
            [1], //X
            [1], //X
            [1], //X
        ],
        [
            [0,1], // X
            [0,1], // X
            [1,1]  //XX
        ]
    ]
    const getBlocks = (n) => {
        let blocks = [];
        let curValidBlocks = [...validBlocks]
        //Randomly select n blocks from validBlocks wtihout replacement
        for (let i = 0; i < n; i++) {
            let index = Math.floor(Math.random() * curValidBlocks.length);
            blocks.push(curValidBlocks[index]);
            curValidBlocks.splice(index, 1);
        }
        return blocks;
    }

    const dragHandler = (e, data, i) => {
        // If the block is being dragged over the grid, then snap it to the grid
        let curBlock = availableBlocks[i];

        //Get the size of the block
        let fullBlockSize = document.getElementById("block" + i).getBoundingClientRect().width;
        let actualBlockSize = curBlock.length * 50.2;
        let blockPadding = (fullBlockSize - actualBlockSize) / 2;
        let blockSize = actualBlockSize;

        //Get the absolute position of the block
        let blockX = document.getElementById("block" + i).getBoundingClientRect().x + blockPadding;
        let blockY = document.getElementById("block" + i).getBoundingClientRect().y;

         //Get the position of the grid
        let gridX = document.getElementById("grid").getBoundingClientRect().x + 150;
        let gridY = document.getElementById("grid").getBoundingClientRect().y;

        //Get the size of the grid
        let gridSize = 401.6;

        //Get the position of the block relative to the grid
        let blockXRel = blockX - gridX;
        let blockYRel = blockY - gridY;
        let blockXRelRounded = Math.round(blockXRel / (gridSize / 8));
        let blockYRelRounded = Math.round(blockYRel / (gridSize / 8));

        //Set the highlights
        let highlights = [];
        for (let i = 0; i < curBlock.length; i++) {
            for (let j = 0; j < curBlock[i].length; j++) {
                if (curBlock[i][j] === 1) {
                    highlights.push([blockXRelRounded + j, blockYRelRounded + i]);
                }
            }
        }

        setHighlights(highlights);
        console.log(highlights)

        console.log("Relative position: " + blockXRelRounded + ", " + blockYRelRounded)
        // console.log(gridSize);
    }
    
    const dragEndHandler = (e, data, i) => {
        //
        setHighlights([]);

        // If the block is over the grid, then set the value of the grid to the block
        //Otherwise move the block back to the initial position

        let curBlock = availableBlocks[i];

        //Get the size of the block
        let fullBlockSize = document.getElementById("block" + i).getBoundingClientRect().width;
        let actualBlockSize = curBlock.length * 50.2;
        let blockPadding = (fullBlockSize - actualBlockSize) / 2;
        let blockSize = actualBlockSize;

        //Get the absolute position of the block
        let blockX = document.getElementById("block" + i).getBoundingClientRect().x + blockPadding;
        let blockY = document.getElementById("block" + i).getBoundingClientRect().y;

         //Get the position of the grid
         let gridX = document.getElementById("grid").getBoundingClientRect().x + 150;
         let gridY = document.getElementById("grid").getBoundingClientRect().y;
 
         //Get the size of the grid
         let gridSize = 401.6;
 
         

        //Get the position of the block relative to the grid
        let blockXRel = blockX - gridX;
        let blockYRel = blockY - gridY;

        //Get the position of the block relative to the grid in terms of the grid
        let blockXRelGrid = Math.round(blockXRel / (gridSize / 8));
        let blockYRelGrid = Math.round(blockYRel / (gridSize / 8));

        //Give buffer for negative x direction
        if(blockXRelGrid === -1)
        {
            blockXRelGrid = 0;
        }

        //Check if the block is over the grid
        if (blockXRelGrid >= 0 && blockXRelGrid < 8 && blockYRelGrid >= 0 && blockYRelGrid < 8) {
            //Check if the block is over a valid position in the grid
            let valid = true;
            console.log(grid)
            
            for (let i = blockYRelGrid; i < curBlock.length + blockYRelGrid; i++) {
                for (let j = blockXRelGrid; j < curBlock[0].length + blockXRelGrid; j++) {
                    if(i < 0 || i >= 8 || j < 0 || j >= 8)
                    {
                        valid = false;
                        break;
                    }
                    if(curBlock[i - blockYRelGrid][j - blockXRelGrid] === 1 && grid[i][j] === 1)
                    {
                        if (grid[i][j] !== 0) {
                            valid = false;
                            break;
                        }
                    }
                }
                if(!valid)
                {
                    break;
                }
            }

            if (valid) {
                //Set the grid to the block
                let newGrid = [...grid];
                
                for (let i = blockYRelGrid; i < curBlock.length + blockYRelGrid; i++) {
                    for (let j = blockXRelGrid; j < curBlock[0].length + blockXRelGrid; j++) {
                        if(curBlock[i - blockYRelGrid][j - blockXRelGrid] === 1)
                        {   
                            newGrid[i][j] = 1;
                        }

                    }
                }
                setGrid(newGrid);
                let newBlockPlaced = [...blockPlaced];
                newBlockPlaced[i] = true;
                setBlockPlaced(newBlockPlaced);
            }
        }
        else
        {
            //Move the block back to the initial position
            console.log("Block not over grid")
            
        }
    }

    const checkBoard = () => {
        if(grid == null || grid.length === 0)
        {
            return;
        }
        //Check if their are available blocks left
        if(blockPlaced.includes(false))
        {
        }
        else
        {
            setAvailableBlocks(getBlocks(3));
            setBlockPlaced([false, false, false]);
            setBlockStates([true, true, true]);
        }

        //Check if rows are full
        let rowCount = 0;
        let filledRows = [];
        for(let i = 0; i < grid.length; i++)
        {
            let full = true;
            for(let j = 0; j < grid[i].length; j++)
            {
                if(grid[i][j] === 0)
                {
                    full = false;
                    break;
                }
            }
            if(full)
            {
                rowCount++;
                filledRows.push(i);
            }
        }
        //Check if columns are full
        let columnCount = 0;
        let filledColumns = [];
        for(let i = 0; i < grid[0].length; i++)
        {
            let full = true;
            for(let j = 0; j < grid.length; j++)
            {
                if(grid[j][i] === 0)
                {
                    full = false;
                    break;
                }
            }
            if(full)
            {
                columnCount++;
                filledColumns.push(i);
            }
        }

        //If there are rows or columns that are full, then remove them
        if(rowCount > 0 || columnCount > 0)
        {
            let newGrid = [...grid];
            for(let i = 0; i < filledRows.length; i++)
            {
                for(let j = 0; j < newGrid[0].length; j++)
                {
                    newGrid[filledRows[i]][j] = 0;
                }
            }
            for(let i = 0; i < filledColumns.length; i++)
            {
                for(let j = 0; j < newGrid.length; j++)
                {
                    newGrid[j][filledColumns[i]] = 0;
                }
            }
            setGrid(newGrid);
        }

        //Add points
        let newPoints = (rowCount + columnCount) * (rowCount + columnCount);
        setPoints(points + newPoints);


        //Check if blocks can be placed
        for(let i = 0; i < availableBlocks.length; i++)
        {
            let curBlock = availableBlocks[i];
            let valid = false;
            for(let j = 0; j < grid.length; j++)
            {
                for(let k = 0; k < grid[j].length; k++)
                {
                    let cur = true;
                    for(let l = j; l < curBlock.length + j; l++)
                    {
                        for(let m = k; m < curBlock[0].length + k; m++)
                        {
                            if(l < 0 || l >= 8 || m < 0 || m >= 8)
                            {
                                valid = false;
                                break;
                            }
                            if(curBlock[l - j][m - k] === 1 && grid[l][m] === 1)
                            {
                                if (grid[l][m] !== 0) {
                                    valid = false;
                                    break;
                                }
                            }
                        }
                        if(!valid)
                        {
                            break;
                        }
                    }
                    if(cur)
                    {
                        valid = true;
                        break;
                    }
                }
                if(valid)
                {
                    break;
                }
            }
            if(!valid)
            {
                let newBlockStates = [...blockStates];
                newBlockStates[i] = false;
                setBlockStates(newBlockStates);
            }
        }
    }

    const isHighlighted = (i, j) => {
        for (let q = 0; q< highlights.length; q++) {
            if (highlights[q][0] === j && highlights[q][1] === i) {
                return true;
            }
        }
        return false;
    }


    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            <Navbar/>

            <Box sx={{ width: "700px" }}>
                {/* Top Control Bar */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, m: 1, bgcolor: "background.paper", width: "100%" }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Points: {points}
                    </Typography>
                    <Button variant="contained" onClick={reset}>New Game</Button>

                </Box>
                {/*Board*/}
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 1, bgcolor: "background.paper", width: "100%" }}>
                    <Grid container spacing={.2} id="grid">
                        {grid.map((row, i) => (
                            <Grid item xs={12} key={i}>
                                <Grid container justifyContent="center" spacing={.2}>
                                    {row.map((col, j) => (
                                        <Grid item key={j}>
                                            <Paper sx={{ width: 50, height: 50, bgcolor: col === 0 ? (
                                                isHighlighted(i, j) ? "secondary.main" : "background.default"
                                            ) : "primary.main" }} />
                                        </Grid>
                                    ))}
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/*Bottom bar, display availableBlocks*/}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, m: 1, bgcolor: 'background.paper', width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, m: 1, bgcolor: 'background.paper', width: '100%' }}>
                        {availableBlocks.map((block, i) => (
                            <>
                                {!blockPlaced[i] ?
                                    <Draggable key={"block" + i}
                                        onDrag={(e, data) => {dragHandler(e, data, i)}}
                                        onStart = {
                                            (e, data) => {
                                                //Set the default position of the block
                                                setBlockDefaultPositions([...blockDefaultPositions, {x: data.x, y: data.y}])
                                            }
                                        }
                                        position={blockPositions[i]}
                                        defaultPosition={blockDefaultPositions[i]}
                                        onStop = {(e, data) => {dragEndHandler(e, data, i)}}
                                        handle=".handle"
                                        disabled={!blockStates[i]}
                                        
                                    >
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 0, m: 0, width: '100%', flexDirection: 'column' }} id={"block" + i}>
                                            {block.map((row, j) => (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 0, m: 0, width: '100%' }} key={i + "," + j}>
                                                    {row.map((col, k) => (
                                                        <div key={"row" + j + "," + k}>
                                                            {col == 1 ?
                                                                <Paper sx={{ width: 50, height: 50, bgcolor: "primary.main" }} className="handle"/>
                                                            :
                                                                <Paper sx={{ width: 50, height: 50, bgcolor: "white", visibility: "hidden" }} />
                                                            }
                                                        </div>
                                                    ))}
                                                </Box>
                                            ))}
                                        </Box>
                                    </Draggable>
                                    :
                                    <></>
                                }
                            </>
                        ))}
                    </Box>
                </Box>

                {/* Loss Panel */}
                <Box sx={{position: "absolute", top: "0", left: "0", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,.5)", visibility: gameOver ? "visible" : "hidden"}}>
                    <Box sx={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "white", borderRadius: "10px", padding: "20px"}}>
                        <Typography variant="h4" component="div" sx={{ textAlign: 'center', userSelect: "none"}}>
                            Game Over
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ textAlign: 'center', userSelect: "none"}}>
                            You scored {points} points
                        </Typography>
                        <Button variant="contained" onClick={reset}>
                            Play Again
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Blocks;