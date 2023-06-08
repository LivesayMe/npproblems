import React from 'react';
import { Box, Button, Grid, MenuItem, Modal, Select, Typography } from '@mui/material';
import "./othello.css";
import OthelloGame from './othello_logic';
import mcts_move from './mcts';
import LineChart from "react-linechart";
import Navbar from '../navbar';

function useInterval(callback, delay) {
    const savedCallback = React.useRef();

    // Remember the latest callback.
    React.useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    React.useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

function Othello(props) {
    const [highlightedTiles, setHighlightedTiles] = React.useState([]);
    const [ghostTile, setGhostTile] = React.useState([-1, -1]);

    const [gameOver, setGameOver] = React.useState(false);

    //Create reference to the game object
    const [game, setGame] = React.useState(null);

    //Player timers 3 minutes
    const [player1Timer, setPlayer1Timer] = React.useState(360000);
    const [player2Timer, setPlayer2Timer] = React.useState(360000);
    const [player1TimerRunning, setPlayer1TimerRunning] = React.useState(false);
    const [player2TimerRunning, setPlayer2TimerRunning] = React.useState(false);
    const [aiWorker, setAIWorker] = React.useState(null);

    const [isPlayerWhite, setIsPlayerWhite] = React.useState(false);
    const [aiWinPercentage, setAIWinPercentage] = React.useState([]);

    const [selectedAI, setSelectedAI] = React.useState("mcts");

    //Create intervals to update the timers
    useInterval(() => {
        if (player1TimerRunning) {
            setPlayer1Timer(player1Timer - 1000);
        }
    }, 1000);

    useInterval(() => {
        if (player2TimerRunning) {
            setPlayer2Timer(player2Timer - 1000);
        }
    }, 1000);


    React.useEffect(() => {
        

        

        //Start the AI background worker
        const worker = new Worker('othello_ai_worker.js');
        worker.onmessage = function(e) {
            let win_rate = e.data.win_rate;
            let new_probabilities = [...e.data.winPercentages];
            new_probabilities.push({x: Math.floor((e.data.game.moveCount + 1) / 2), y: win_rate});
            setAIWinPercentage(new_probabilities);

            let newgame = new OthelloGame();
            newgame.board = e.data.game.board;
            newgame.curColor = e.data.game.curColor;
            newgame.gameOver = e.data.game.gameOver;
            newgame.score = e.data.game.score;
            newgame.moveCount = e.data.game.moveCount;
            
            newgame.makeMove(e.data.move[0], e.data.move[1]);
            setGame(newgame);
        }
        setAIWorker(worker);

        //Start the player 1 timer
        setPlayer1TimerRunning(true);

        //Create a new game object
        setGame(new OthelloGame());
    }, []);

    React.useEffect(() => {
        if (player1Timer <= 0) {
            setPlayer1TimerRunning(false);
            setPlayer2TimerRunning(false);
            setGameOver(true);
            let newgame = game.copy();
            newgame.gameOver = true;
            newgame.score = -1;
            setGame(newgame);
        } else if (player2Timer <= 0) {
            setPlayer1TimerRunning(false);
            setPlayer2TimerRunning(false);
            setGameOver(true);
            let newgame = game.copy();
            newgame.gameOver = true;
            newgame.score = 1;
            setGame(newgame);
        }
    }, [player1Timer, player2Timer]);

    React.useEffect(() => {
        if (game !== null && !game.gameOver) {
            if (game.curColor === 1) {
                //Start player 1 timer
                setPlayer1TimerRunning(true);
                //Stop player 2 timer
                setPlayer2TimerRunning(false);

                //Get the AI move
                if(!isPlayerWhite) {
                    let timeForMove = 1000;
                    if(player2Timer < 10000) { //If there is less than 10 seconds left, use a shorter time
                        timeForMove = player2Timer / (64-game.moveCount); //Use the time left divided by the number of moves left
                    } else {
                        //Endgame should have less time, middle game most time
                        if(game.moveCount < 20) {
                            timeForMove = 5000;
                        } else if (game.moveCount < 40) {
                            timeForMove = 10000;
                        } else {
                            timeForMove = 5000;
                        }
                    }

                    aiWorker.postMessage({game: game, time: timeForMove / 1000, winPercentages: aiWinPercentage, ai: selectedAI});
                }
            } else if (game.curColor === -1) {
                //Start player 2 timer
                setPlayer2TimerRunning(true);
                //Stop player 1 timer
                setPlayer1TimerRunning(false);

                if(isPlayerWhite) {
                    let timeForMove = 1000;
                    if(player1Timer < 10000) { //If there is less than 10 seconds left, use a shorter time
                        timeForMove = player1Timer / (64-game.moveCount); //Use the time left divided by the number of moves left
                    } else {
                        //Endgame should have less time, middle game most time
                        if(game.moveCount < 20) {
                            timeForMove = 2000;
                        } else if (game.moveCount < 40) {
                            timeForMove = 5000;
                        } else {
                            timeForMove = 1000;
                        }
                    }

                    aiWorker.postMessage({game: game, time: timeForMove / 1000, winPercentages: aiWinPercentage, ai: selectedAI});
                }
            }
        } else if(game != null && game.gameOver) {
            setPlayer1TimerRunning(false);
            setPlayer2TimerRunning(false);

            setGameOver(true);
        }
    }, [game]);

    const placeTile = (x, y) => {
        // Place the tile
        let newGame = game.copy()
        newGame.placeTile(x, y);
        setGame(newGame);
        // Update the board
        setHighlightedTiles([]);
        setGhostTile([-1, -1]);
    }

    const highlightTiles = (x, y) => {
        let tilesToHighlight = game.getTilesToFlip(game.curColor, x, y);
        setHighlightedTiles(tilesToHighlight);
    }

    const getTileElem = (x, y) => {
        let tile = game.board[x][y];
        let defaultStyle = {
            width: "80px",
            height: "80px",
            backgroundColor: "green",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            border: "1px solid #696",
            // Add box shadow to make it look like a 3D board
            boxShadow: "inset 1px 1px 4px rgba(0, 0, 0, 0.6)",
        }
        let style = {
            width: "90%",
            height: "90%",
            //Add 
        };
        if (tile === 1) {
            style.backgroundColor = "#111";
            style.border = "1px solid #333";
            style.boxShadow = "inset 0 0 10px rgba(0, 0, 0, 0.9), 0 2px 2px rgba(0, 0, 0, 0.9)";
        } else if (tile === -1) {
            style.backgroundColor = "#f1f1f1";
            style.border = "1px solid #d9d9d9";
            style.boxShadow = "inset 0 0 10px rgba(255, 255, 255, 0.9), 0 2px 2px rgba(0, 0, 0, 0.9)";
        }
        
        // Check if tile is highlighted
        for (let i = 0; i < highlightedTiles.length; i++) {
            if (highlightedTiles[i][0] === x && highlightedTiles[i][1] === y) {
                //Add pulsing animation
                style.animation = "pulse 1s infinite";
                style.animationName = "pulse";
                break;
            }
        }

        let tileElem = <Box sx={{...style,
            borderRadius: "50%",
        }}></Box>;

        return (
            <Box sx={defaultStyle} onClick = {() => {
                let playerColor = isPlayerWhite ? 1 : -1;
                if (game.isTileValid(game.curColor, x, y) && game.curColor === playerColor) {
                    placeTile(x, y);
                }
            }} onMouseEnter = {() => {
                let playerColor = isPlayerWhite ? 1 : -1;
                if(game.isTileValid(game.curColor, x, y) && game.curColor === playerColor) {
                    highlightTiles(x, y);
                    setGhostTile([x, y]);
                }
            }} onMouseLeave = {() => {
                setHighlightedTiles([]);
                setGhostTile([-1, -1]);
            }}>
                {tile === 0 ? <div></div> : tileElem}
                {ghostTile[0] === x && ghostTile[1] === y ? <Box sx={{...style, 
                    borderRadius: "50%",
                    backgroundColor: game.curColor === 1 ? "#111" : "#f1f1f1",
                    opacity: "0.5",
                }}></Box> : <div></div>
                }
            </Box>
        );
    }

    const convertTime = (time) => {
        let minutes = Math.floor(time / 60000);
        let seconds = ((time % 60000) / 1000).toFixed(0);

        return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column", mt: 0, overflow: "hidden", }}>
            <Navbar/>
            {game != null &&
            <>
            <Modal open={gameOver} onClose={() => {
                setGameOver(false);
            }}>
                <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, bgcolor: "background.paper", border: "2px solid #000", boxShadow: 24, p: 4 }}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Game Over
                    </Typography>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {game.getScore(1) > game.getScore(-1) ? "Black" : "White"} wins!
                    </Typography>
                    <Button variant="contained" onClick={() => {
                        setGameOver(false);
                        //Reset timers
                        setPlayer1TimerRunning(true);
                        setPlayer2TimerRunning(false);
                        setPlayer1Timer(180000);
                        setPlayer2Timer(180000);
                        setAIWinPercentage([]);
                        //Reset game
                        game.reset();
                    }}>Play Again</Button>
                </Box>
            </Modal>

            {/* Main content*/}
            <Box sx={{
                display: "flex",
                flexGrow: 1,
                flexDirection: "row",
                justifyContent: "space-around",
                alignItems: "center",
                width: "100%",
                height: "100%",
            }}>
                <Box sx={{ display: "flex", flexGrow: 1, width: "100%", height: "100%", mt: 4, flexDirection: "column", alignItems: "center"}}>
                    {/* Scoreboard */}
                    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", width: "650px", height: "100%", color: "black", mb: 2}}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Score
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Black: {game.getScore(1)}
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            White: {game.getScore(-1)}
                        </Typography>

                        <Select value={selectedAI} onChange={(e) => {
                            setSelectedAI(e.target.value);
                        }}>
                            <MenuItem value={"random"}>Random</MenuItem>
                            <MenuItem value={"greedy"}>Greedy</MenuItem>
                            <MenuItem value={"alpha_beta"}>Alpha Beta</MenuItem>
                            <MenuItem value={"mcts"}>MCTS</MenuItem>
                        </Select>
                    </Box>

                    {/* Board Grid*/}
                    {game.board.length === 0 ? <div>Loading...</div> : 
                    <Grid container spacing={0} sx={{ width: "100%", height: "100%", flex: 1 }}>
                        {game.board.map((row, i) => (
                            <Grid item xs={12} sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", height: "100%" }} key={"row" + i}>
                                {row.map((col, j) => (
                                    <Grid item xs={0} sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", height: "100%" }} key={"column" + j}>
                                        {getTileElem(i, j)}
                                    </Grid>
                                ))}
                            </Grid>
                        ))}
                    </Grid>}

                    {/* Timers */}
                    <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", width: "650px", height: "100%", color: "black", mt: 2}}>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Time
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Black: {convertTime(player1Timer)}
                        </Typography>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            White: {convertTime(player2Timer)}
                        </Typography>
                    </Box>

                    {/* Plot of AI win rate */}
                    

                </Box>
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center", width: "650px", height: "100%", color: "black", mt: 2, mr: 10}}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        AI Predicted Win Rate
                    </Typography>
                    {aiWinPercentage.length > 0 &&
                    <LineChart width={600} height={300} data={[{color: "steelblue", points: aiWinPercentage}]} xLabel={"Turn"} hideYLabel={true} yMin={0} yMax={1} ticks={aiWinPercentage.length}/>}
                </Box>
            </Box>

            </>}
        </Box>
    );
}

export default Othello;