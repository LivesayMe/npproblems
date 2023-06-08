import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Navbar from '../navbar';

export default function BullsCows() {
    const [guesses, setGuesses] = React.useState([]);
    const [results, setResults] = React.useState([]);
    const [secret, setSecret] = React.useState([]);
    const [problemSize, setProblemSize] = React.useState(4);
    const [isSolved, setIsSolved] = React.useState(false);
    const [revealSolution, setRevealSolution] = React.useState(false);

    useEffect(() => {
        //Generate new secret
        setSecret(generateSecret(problemSize));
    }, [problemSize]);

    const generateSecret = (size) => {
        //All digits must be different
        let secret = [];
        let digits = [1,2,3,4,5,6,7,8,9]
        for (let i = 0; i < size; i++) {
            let index = Math.floor(Math.random() * digits.length);
            secret.push(digits[index]);
            digits.splice(index, 1);
        }

        return secret;
    }

    const handleProblemSize = (event, newSize) => {
        setProblemSize(newSize);
    }

    const reset = () => {
        setGuesses([]);
        setResults([]);
        setSecret(generateSecret(problemSize));
    }

    const checkGuess = (guess) => {
        let correctDigits = 0;
        let correctPositions = 0;
        let secretCopy = secret.slice();
        let guessCopy = guess.slice();

        //Check for correct digits
        for (let i = 0; i < problemSize; i++) {
            let index = secretCopy.indexOf(guessCopy[i]);
            if (index > -1) {
                correctDigits++;
                secretCopy.splice(index, 1);
                guessCopy.splice(i, 1);
            }
        }

        //Check for correct positions
        for (let i = 0; i < problemSize; i++) {
            if (secret[i] === guess[i]) {
                correctPositions++;
            }
        }

        return [correctDigits, correctPositions];
    }

    const handleRevealSolution = () => {

    }

    const handleGuess = (event) => {
        let guess = [];
        for (let i = 0; i < problemSize; i++) {
            let digit = document.getElementById("guess" + i).value;
            guess.push(digit);
        }
        setGuesses(guesses.concat(guess));
        setResults(results.concat(checkGuess(guess)));
    }

  return (
    <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            <Navbar/>

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
                        value={problemSize}
                        exclusive
                        onChange={handleProblemSize}
                        aria-label="grid size"
                        
                    >
                        <ToggleButton value={4} aria-label="4 Digits">
                            4 Digits
                        </ToggleButton>
                        <ToggleButton value={7} aria-label="7 Digits">
                            7 Digits
                        </ToggleButton>
                        <ToggleButton value={10} aria-label="10 Digits">
                            10 Digits
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {/*Board*/}
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 1, m: 1, bgcolor: "background.paper", width: "100%" }}>
                    <Grid container spacing={2}>
                        
                    </Grid>
                    
                </Box>

                {/*Bottom bar*/}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1, m: 1, bgcolor: 'background.paper', width: '100%' }}>
                    <Box>
                        {/* Current guess count */}
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {guesses.length}
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
