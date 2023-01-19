import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

export default function NQueens() {
    const [boardSize, setBoardSize] = React.useState(8);
    const [board, setBoard] = React.useState([]);
    const [solution, setSolution] = React.useState([]);
    const [isSolved, setIsSolved] = React.useState(false);
    const [revealSolution, setRevealSolution] = React.useState(false);
    const [queenCount, setQueenCount] = React.useState(0);

    const n4solution = [
        [0, 1, 0, 0],
        [0, 0, 0, 1],
        [1, 0, 0, 0],
        [0, 0, 1, 0]
    ]
    const n8solution = [
        [0,0,0,1,0,0,0,0],
        [0,0,0,0,0,0,1,0],
        [0,0,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,1],
        [0,1,0,0,0,0,0,0],
        [0,0,0,0,1,0,0,0],
        [1,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,0,0]
    ]

    const n12solution = [
        [0,0,0,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,1,0,0,0],
        [0,0,0,0,0,0,1,0,0,0,0,0],
        [0,1,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,1,0],
        [0,0,0,0,0,1,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,1],
        [0,0,0,0,0,0,0,0,0,1,0,0],
        [0,0,0,0,0,0,0,1,0,0,0,0],
        [0,0,0,0,1,0,0,0,0,0,0,0],
        [0,0,1,0,0,0,0,0,0,0,0,0],
        [1,0,0,0,0,0,0,0,0,0,0,0],
    ]

    const queen = "♕";

    useEffect(() => {
        setIsSolved(false);
        setRevealSolution(false);
        setBoard(createBoard(boardSize));
    }, [boardSize]);

    useEffect(() => {
        reset();
    }, []);

    const createBoard = (size) => {
        setQueenCount(0);
        let newBoard = [];
        for (let i = 0; i < size; i++) {
            let row = [];
            for (let j = 0; j < size; j++) {
                row.push(0);
            }
            newBoard.push(row);
        }
        return newBoard;
    }

    const reset = () => {
        setBoard(createBoard(boardSize));
        setIsSolved(false);
        setRevealSolution(false);
    }

    const handleBoardSize = (event, newBoardSize) => {
        setBoardSize(newBoardSize);
    }

    const clearSolution = () => {
        reset();
    }

    const handleRevealSolution = () => {
        setRevealSolution(true);
        if(boardSize == 4)
        {
            setBoard(n4solution);
        }
        else if(boardSize == 8)
        {
            setBoard(n8solution);
        }
        else if(boardSize == 12)
        {
            setBoard(n12solution);
        }
    }

    const isAttacked = (x,y) => {
        if(x < 0 || x >= boardSize || y < 0 || y >= boardSize)
        {
            return false;
        }
        if(board === null)
        {
            return false;
        }
        if(board.length < boardSize)
            return false;
        //Checks if the square at (x,y) can be attacked by any queen on the board
        //Check row
        for (let i = 0; i < boardSize; i++) {
            if (board[x][i] === 1) {
                return true;
            }
        }
        //Check column
        for (let i = 0; i < boardSize; i++) {
            if (board[i][y] === 1) {
                return true;
            }
        }
        //Check diagonals
        for (let i = 0; i < boardSize; i++) {
            for (let j = 0; j < boardSize; j++) {
                if (Math.abs(i - x) === Math.abs(j - y) && board[i][j] === 1) {
                    return true;
                }
            }
        }
        return false;
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

            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 1, bgcolor: 'background.paper', width: "100%" }}>
                Place N queens such that no queen can attack another queen
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
                        <ToggleButton value={4} aria-label="5x5">
                            4x4
                        </ToggleButton>
                        <ToggleButton value={8} aria-label="10x10">
                            8x8
                        </ToggleButton>
                        <ToggleButton value={12} aria-label="15x15">
                            12x12
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {/*Board*/}
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 1, bgcolor: "background.paper", width: "100%" }}>
                    <Grid container sx={{ width: "100%", height: "100%", justifyContent: "center", alignItems: "center" }}>
                        {board.map((row, i) => (
                            <Grid item key={i}>
                                {row.map((col, j) => (
                                    <Grid item key={i+","+j}>
                                        <Paper sx={{ 
                                            width: "50px", height: "50px", display: "flex", justifyContent: "center", alignItems: "center",
                                            fontSize: "30px", fontWeight: "bold", color: "black",
                                            backgroundColor: (isAttacked(i,j)) ? (i + j) % 2 === 0 ? "rgb(235,200,200)" : "rgb(220,160,160)" : (i + j) % 2 === 0 ? "rgb(210,210,210)" : "rgb(160,160,160)",
                                            userSelect: "none", cursor: "pointer",
                                            '&:hover': {
                                                boxShadow: 5,
                                            }
                                        }}
                                            onClick={() => {
                                                if( board[i][j] === 1)
                                                {
                                                    let newBoard = JSON.parse(JSON.stringify(board));
                                                    newBoard[i][j] = 0;
                                                    setBoard(newBoard);
                                                    setQueenCount(queenCount - 1);
                                                    return;
                                                }
                                                else
                                                {
                                                    if (!isAttacked(i, j)) {
                                                        //Deep copy board
                                                        let newBoard = JSON.parse(JSON.stringify(board));
                                                        newBoard[i][j] = 1;
                                                        setBoard(newBoard);
                                                        if(queenCount + 1 === boardSize)
                                                        {
                                                            setIsSolved(true);
                                                        }
                                                        setQueenCount(queenCount + 1);
                                                    }
                                                }
                                            }}
                                        >
                                            {board[i][j] === 1 ? queen : ""}
                                        </Paper>
                                    </Grid>
                                ))}
                            </Grid>
                        ))}
                    </Grid>
                </Box>

                {/*Bottom bar*/}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, m: 1, bgcolor: 'background.paper', width: '100%' }}>
                    <Button variant="contained" onClick={clearSolution}>Clear</Button>
                    <Box>
                        {/* Current queen count */}
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {queenCount}/{boardSize}
                        </Typography>
                    </Box>
                    {revealSolution ? 
                        <Button variant="contained" onClick={reset}>
                            Reset
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
                        <Button variant="contained" onClick={reset}>
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
