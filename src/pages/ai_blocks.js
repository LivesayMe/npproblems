import React from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Draggable, {DraggableCore} from 'react-draggable';
import Blocks from './blocks_logic';
import mcts_move from './mcts';
import Navbar from '../navbar';

function AIBlocks(props) {
    const [gameOver, setGameOver] = React.useState(false);
    const [blockStates, setBlockStates] = React.useState([true, true, true]); //Stores whether or not a block can be placed
    const [blockDefaultPositions, setBlockDefaultPositions] = React.useState([]); //Stores the default position of each block
    const [blockPositions, setBlockPositions] = React.useState([{x:0,y:0}, {x:0,y:0}, {x:0,y:0}]); //Stores the current position of each block
    const [blockPlaced, setBlockPlaced] = React.useState([false, false, false]); //Stores whether or not a block has been placed
    const [highlights, setHighlights] = React.useState([]); //Stores the highlights for each block



    const [game, setGame] = React.useState(new Blocks());
    const [AIGame, setAIGame] = React.useState(new Blocks());

    const [aiMoveController, setAIMoveController] = React.useState(null);


    React.useEffect(() => {
        reset();
    }, []);

    const reset = () => {
        if (aiMoveController != null) {
            clearInterval(aiMoveController);
        }
        resetGrid();
        setGameOver(false);
        setBlockStates([true, true, true]);
        setBlockPlaced([false, false, false]);

        //Create web worker to run getAIMove
        let worker = new Worker("block_ai_worker.js");
        worker.onmessage = function(e) {
            
            AIGame.makeMove(e.data.block, e.data.move);
            let newGame = new Blocks();
            newGame.grid = AIGame.grid;
            newGame.availableBlocks = AIGame.availableBlocks;
            newGame.score = AIGame.score;
            newGame.gameOver = AIGame.gameOver;
            setAIGame(newGame);
        }

        //Run getAIMove every 1 second
        setAIMoveController(setInterval(() => {
            if (AIGame.gameOver) {

                clearInterval(aiMoveController);
            }
            else
            {
                worker.postMessage({game: AIGame});
            }
        }, 1000));

    }

    const resetGrid = () => {
        setGame(new Blocks());
        setAIGame(new Blocks());
    }

    const dragHandler = (e, data, i) => {
        // If the block is being dragged over the grid, then snap it to the grid
        let curBlock = game.availableBlocks[i];

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
    }
    
    const dragEndHandler = (e, data, i) => {
        //
        setHighlights([]);

        // If the block is over the grid, then set the value of the grid to the block
        //Otherwise move the block back to the initial position

        let curBlock = game.availableBlocks[i];

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
            
            for (let i = blockYRelGrid; i < curBlock.length + blockYRelGrid; i++) {
                for (let j = blockXRelGrid; j < curBlock[0].length + blockXRelGrid; j++) {
                    if(i < 0 || i >= 8 || j < 0 || j >= 8)
                    {
                        valid = false;
                        break;
                    }
                    if(curBlock[i - blockYRelGrid][j - blockXRelGrid] === 1 && game.grid[i][j] === 1)
                    {
                        if (game.grid[i][j] !== 0) {
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
                makeMove(blockYRelGrid, blockXRelGrid , curBlock);
            }
        }
        else
        {
            //Move the block back to the initial position
        }
    }

    const makeMove = (x,y, curBlock) => {
        game.makeMove(curBlock, [x, y]);
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
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column", overflowX: "hidden" }}>
            <Navbar/>
            <Button variant="contained" onClick={reset} sx={{m:2}}>New Game</Button>

            <Box sx={{ width: {
                xs: "100%",
                sm: "100%",
                md: "100%",
                lg: "100%",
                xl: "1400px"
            }, display: "flex", flexDirection: {
                xs: "column",
                sm: "column",
                md: "column",
                lg: "row",
            } }}>
                <Box sx={{display: "flex", flexDirection: "column"}}>
                    {/* Top Control Bar */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, m: 1, bgcolor: "background.paper", width: "100%" }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Points: {game.score}
                        </Typography>
                    </Box>
                    {/*Board*/}
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 1, bgcolor: "background.paper", width: "100%" }}>
                        <Grid container spacing={.2} id="grid">
                            {game.grid.map((row, i) => (
                                <Grid item xs={12} key={i}>
                                    <Grid container justifyContent="center" spacing={.2}>
                                        {row.map((col, j) => (
                                            <Grid item key={j}>
                                                <Paper sx={{ width: 50, height: 50, bgcolor: col === 0 ? (
                                                    isHighlighted(i, j) ? "secondary.main" : "background.default"
                                                ) : (
                                                    game.isGameOver() ? "grey" :
                                                    "primary.main")
                                                }} />
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
                            {game.availableBlocks.map((block, i) => (
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
                                            disabled={!game.isBlockHasMoves(block)}
                                            
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 0, m: 0, width: '100%', flexDirection: 'column' }} id={"block" + i}>
                                                {block.map((row, j) => (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 0, m: 0, width: '100%' }} key={i + "," + j}>
                                                        {row.map((col, k) => (
                                                            <div key={"row" + j + "," + k}>
                                                                {col == 1 ?
                                                                    <Paper sx={{ width: 50, height: 50, bgcolor: (
                                                                        !game.isBlockHasMoves(block)
                                                                        ? "grey"
                                                                        : "primary.main") }} className="handle"/>
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
                </Box>
                
                <Box sx={{display: "flex", flexDirection: "column"}}>
                    {/* Top Control Bar */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, m: 1, bgcolor: "background.paper", width: "100%" }}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            AI Points: {AIGame.score}
                        </Typography>
                    </Box>
                    {/*AI Board*/}
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 1, bgcolor: "background.paper", width: "100%" }}>
                        <Grid container spacing={.2} id="grid">
                            {AIGame.grid.map((row, i) => (
                                <Grid item xs={12} key={i}>
                                    <Grid container justifyContent="center" spacing={.2}>
                                        {row.map((col, j) => (
                                            <Grid item key={j}>
                                                <Paper sx={{ width: 50, height: 50, bgcolor: col === 0 ? ("background.default") : (AIGame.isGameOver() ? "grey" : "secondary.main")}} />
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    {/*Bottom bar, display AI availableBlocks*/}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, m: 1, bgcolor: 'background.paper', width: '100%' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 1, m: 1, bgcolor: 'background.paper', width: '100%' }}>
                            {AIGame.availableBlocks.map((block, i) => (
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
                                            disabled={true}
                                            
                                        >
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 0, m: 0, width: '100%', flexDirection: 'column' }} id={"block" + i}>
                                                {block.map((row, j) => (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 0, m: 0, width: '100%' }} key={i + "," + j}>
                                                        {row.map((col, k) => (
                                                            <div key={"row" + j + "," + k}>
                                                                {col == 1 ?
                                                                    <Paper sx={{ width: 50, height: 50, bgcolor: "secondary.main" }} className="handle"/>
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
                </Box>

                {/* Loss Panel */}
                <Box sx={{position: "absolute", top: "0", left: "0", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,.5)", visibility: (game.isGameOver() && AIGame.isGameOver()) ? "visible" : "hidden"}}>
                    <Box sx={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "white", borderRadius: "10px", padding: "20px"}}>
                        <Typography variant="h4" component="div" sx={{ textAlign: 'center', userSelect: "none"}}>
                            Game Over
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ textAlign: 'center', userSelect: "none"}}>
                            You scored {game.score} points, AI scored {AIGame.score} points
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

export default AIBlocks;