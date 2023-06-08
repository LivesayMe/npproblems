import React, {useState, useEffect} from 'react'
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Tooltip } from '@mui/material';
import Navbar from '../navbar';

export default function Tictactoe() {
    const [board, setBoard] = useState(Array(9).fill(null));
    const [player, setPlayer] = useState('X');
    const [winner, setWinner] = useState(null);
    const [gameOver, setGameOver] = useState(false);
    const [gameMode, setGameMode] = useState('random');


    useEffect(() => {
        checkGameOver();
    }, [board, player]);

    const handleGameMode = (event, newGameMode) => {
        setGameMode(newGameMode);
    };

    const randomAIMove = (cboard, cplayer) => {
        let emptySquares = cboard.reduce((a, e, i) => (e === null ? a.concat(i) : a), []);
        let randomSquare = emptySquares[Math.floor(Math.random() * emptySquares.length)];
        cboard[randomSquare] = cplayer;
        setBoard(cboard);
        setPlayer(cplayer === 'X' ? 'O' : 'X');
    }   
    
    //Returns the score of the board
    const scores = {
        X: -10,
        O: 10,
        Tie: 0
    }
    const minimax = (newBoard, isMaximizing, depth, maxDepth) => {
        let result = checkWinner(newBoard);

        if(result !== null)
        {
            return scores[result];
        }

        if(depth == maxDepth)
        {
            return 0;
        }

        if(isMaximizing)
        {
            let bestScore = -Infinity;
            for(let i = 0; i < newBoard.length; i++)
            {
                if(newBoard[i] == null)
                {
                    //Copy board
                    let newBoardCopy = newBoard.slice();
                    newBoardCopy[i] = 'O';
                    let score = minimax(newBoardCopy, false, depth + 1, maxDepth);
                    bestScore = Math.max(score, bestScore);
                }
            }
            return bestScore;
        }
        else
        {
            let bestScore = Infinity;
            for(let i = 0; i < newBoard.length; i++)
            {
                if(newBoard[i] == null)
                {
                    let newBoardCopy = newBoard.slice();
                    newBoardCopy[i] = 'X';
                    let score = minimax(newBoardCopy, true, depth + 1, maxDepth);
                    bestScore = Math.min(score, bestScore);
                }
            }
            return bestScore;
        }
    }

    const perfectAIMove = (cboard, cplayer) => {
        //Play the perfect move
        let bestScore = -Infinity;
        let move;
        console.log("Checking for perfect move...")
        for(let i = 0; i < cboard.length; i++)
        {
            if(cboard[i] == null)
            {
                cboard[i] = cplayer;
                let score = minimax(cboard, (
                    cplayer === 'X' ? true : false
                ), 0, 5);

                cboard[i] = null;
                if(score > bestScore)
                {
                    bestScore = score;
                    move = i;
                }
            }
        }
        console.log("Best move is: " + move);
        cboard[move] = cplayer;
        setBoard(cboard);
        setPlayer(cplayer === 'X' ? 'O' : 'X');
    }

    const checkWinner = (cboard) => {
        let winLines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]

        for(let i = 0; i < winLines.length; i++)
        {
            const [a, b, c] = winLines[i];
            if(cboard[a] && cboard[a] === cboard[b] && cboard[a] === cboard[c])
            {
                return cboard[a];
            }
        }

        if(cboard.every((element) => element != null))
        {
            return "Tie";
        }

        return null;
    }

    const checkGameOver = () => {
        let winLines = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ]

        for(let i = 0; i < winLines.length; i++)
        {
            const [a, b, c] = winLines[i];
            if(board[a] && board[a] === board[b] && board[a] === board[c])
            {
                setWinner(board[a]);
                setGameOver(true);
            }
        }

        if(board.every((element) => element != null))
        {
            setGameOver(true);
        }
    }

    const handleTileClick = (index) => {
        if(gameMode == "multi")
        {
            if(board[index] == null && !gameOver)
            {
                board[index] = player;
                setBoard(board);
                setPlayer(player == 'X' ? 'O' : 'X');
            }
        }
        else if(gameMode == "random")
        {
            if(board[index] == null && !gameOver)
            {
                //Deep copy board
                let boardCopy = board.slice();
                boardCopy[index] = player;
                setBoard(boardCopy);
                randomAIMove(boardCopy, player == 'X' ? 'O' : 'X');
            }
        }
        else if(gameMode == "perfect")
        {
            if(board[index] == null && !gameOver)
            {
                //Deep copy board
                let boardCopy = board.slice();
                boardCopy[index] = player;
                setBoard(boardCopy);
                perfectAIMove(boardCopy, player == 'X' ? 'O' : 'X');
            }
        }
    }

    const handleReset = () => {
        setBoard(Array(9).fill(null));
        setPlayer('X');
        setWinner(null);
        setGameOver(false);
    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            <Navbar/>

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 1, bgcolor: 'background.paper', width: "100%" }}>
                Not an NP-Complete problem, just here for fun. Perfect AI uses minimax algorithm.
            </Box>
            {/* Top control bar (reset)*/}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 0, bgcolor: "background.paper", width: "100%" }}>
                <Button variant="contained" onClick={handleReset}>Reset</Button>
            </Box>

            {/* Game board, secondary color */}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 0, bgcolor: "background.paper", width: "100%" }}>
                <Grid container spacing={1} sx={{ width: "200px", height: "100%" }}>
                    {board.map((value, index) => (
                        <Grid item xs={4} sx={{ width: "100%", height: "100%" }} key={index}>
                            <Paper sx={{ width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", bgcolor: "secondary.main", width: "50px", height: "50px",
                            '&:hover': { cursor: "pointer", backgroundColor: "secondary.dark" } 
                        }} onClick={() => handleTileClick(index)}>
                                <Typography variant="h3" component="div" sx={{ flexGrow: 1, textAlign: "center" }}>
                                    {value}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            {/*Settings bar*/}
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 0, bgcolor: "background.paper", width: "100%" }}>
                <ToggleButtonGroup
                    value={gameMode}
                    exclusive
                    onChange={handleGameMode}
                    aria-label="game mode"
                >
                    <ToggleButton value="random" aria-label="random ai">
                        Random AI
                    </ToggleButton>
                    <ToggleButton value="perfect" aria-label="perfect ai">
                        Perfect AI
                    </ToggleButton>
                    <ToggleButton value="multi" aria-label="multi player">
                        Multiplayer
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* Congratulations panel*/}    
            <Box sx={{position: "absolute", top: "0", left: "0", width: "100%", height: "100%", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,.5)", visibility: gameOver ? "visible" : "hidden"}}>
                    <Box sx={{display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", backgroundColor: "white", borderRadius: "10px", padding: "20px"}}>
                        <Typography variant="h4" component="div" sx={{ textAlign: 'center', userSelect: "none"}}>
                            {winner ? "Congratulations! " + winner + " has won!" : "It's a tie!"}
                        </Typography>
                        <Box sx={{display: "flex", flexDirection: "row", justifyContent: "space-evenly", width: "100%", minWidth: "500px"}}>                       
                            <Button variant="contained" onClick={handleReset}>
                                Play Again
                            </Button>
                            <Button variant ="contained" onClick={() => setGameOver(false)}>
                                Close
                            </Button>
                        </Box>
                    </Box>
                </Box>
        </Box>
    )
}
