import React, { useEffect } from 'react';
import { Box, Button, Grid, MenuItem, Modal, Paper, Select, TextField, Typography } from '@mui/material';
import "./othello.css";
import OthelloGame from './othello_logic';
import mcts_move from './mcts';
import LineChart from "react-linechart";
import Liars from './liarsdice_logis';
import "./liars.css"
import Navbar from '../navbar';

function LiarsDice(props) {
    const [game, setGame] = React.useState(new Liars(4, 6));

    const [numberBid, setNumberBid] = React.useState(1);
    const [countBid, setCountBid] = React.useState(1);

    const [paused, setPaused] = React.useState(false);

    const [trueCount, setTrueCount] = React.useState(0);
    const [betCount, setBetCount] = React.useState(0);

    const aiTime = 2000;

    useEffect(() => {
        if(game.gameOver) {
            alert("Game Over");
        } else {
            if(game.currentPlayer != 0) { //Check if AI player
                //If the game is paused, wait for user to unpause
                if(paused) {
                    return;
                }

                //AI player, wait 1 second before making move
                setTimeout(() => {
                    aiMove();
                }, aiTime);
            }
            setNumberBid(game.currentBid[1]);
            setCountBid(game.currentBid[0]);
        }
    }, [game]);

    useEffect(() => {
        if(paused)
            return;

        if(game.gameOver) {
            alert("Game Over");
        } else {
            if(game.currentPlayer != 0) { //Check if AI player
                //AI player, wait 1 second before making move
                setTimeout(() => {
                    aiMove();
                }, aiTime);
            }
            setNumberBid(game.currentBid[1]);
            setCountBid(game.currentBid[0]);
        }
    }, [paused]);

    const aiMove = () => {
        //Calculate probability of current bid
        let callProb = game.expectedProbability(game.currentPlayer, game.currentBid[1], game.currentBid[0]);
        let move = [];
        if(callProb < 0.2) {
            //CALL
            move = [0, -1];
        } else {
            //Pick random move
            let moves = game.getAvailableMoves();
            
            //Pick move with highest probability
            let maxProb = 0;
            let maxMove = [];
            for(let i = 0; i < moves.length; i++) {
                if(moves[i][1] == -1) {
                    continue;
                }
                let prob = game.expectedProbability(game.currentPlayer, moves[i][1], moves[i][0]);
                if(prob > maxProb) {
                    maxProb = prob;
                    maxMove = moves[i];
                }
            }
            console.log("Move: " + maxMove + " has probability: " + maxProb);
            move = maxMove;

            if(maxProb < callProb) { //CALL is bad, but RAISE is worse
                //CALL
                move = [0, -1];
                console.log("CALLING with prob: " + callProb);
            }
        }
        setBetCount(game.currentBid[0])
        if(move[0] == 0 && move[1] == -1) {
            let actualCount = (game.rolls.map(q => q.filter((x) => x == game.currentBid[1]).length)).reduce((partial, a) => partial+a, 0);
            setTrueCount(actualCount);
            setPaused(true);
        }
        
        let newGame = game.copy();
        newGame.makeMove(move);
        setGame(newGame);
        
    }

    const getDieElement = (die) => {
        let style = {
            width: "50px",
            height: "50px",
            borderRadius: "10px",
            backgroundColor: "white",
            border: "1px solid black",
            position: "relative",
            padding: "5px",
        }
        let className = "dice-" + die;
        
        return (
            <div className={className} style={style}>
                {Array(die).fill(0).map((_, i) => {
                    return ( <span key={i} className="dot"></span> )})}
            </div>
        )

    }

    const makeMove = (move) => {
        //Convert move to number
        let newGame = game.copy();
        move[0] = parseInt(move[0]);
        move[1] = parseInt(move[1]);

        newGame.makeMove(move);
        setGame(newGame);
    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column", mt: 0, overflow: "hidden", }}>
            <Navbar/>

            <Modal open={paused} onClose={() => {setPaused(false)}} sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}>
                <Box sx={{
                    backgroundColor: "white",
                    border: "2px solid #000",
                    boxShadow: 24,
                    p: 4,
                }}>
                    True: {trueCount} Bet: {betCount}
                    <br/>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        {trueCount < betCount ? "Bet was wrong!": ("Bet was correct!")}
                    </Typography>
                    <Button onClick={() => {setPaused(false)}}>Continue</Button>
                </Box>
            </Modal>
            {/* Main content */}
            <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column", mt: 0, overflow: "hidden", }}>
                {/* Show players */}
                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-around",
                    p: 1,
                }}>
                    {game.players.map((player, index) => (
                        <Box sx={{
                            display: "flex",
                            flexDirection: "column",
                            flexWrap: "wrap",
                            justifyContent: "space-around",
                            p: 1,
                        }}>
                            <Box key={player + "," + index} sx={{
                                display: "flex",
                                flexDirection: "column",
                                flexWrap: "wrap",
                                justifyContent: "space-around",
                                p: 1,
                                m: 2,
                                border: "2px solid " + (game.currentPlayer == index ? "red" : "black"),
                                borderRadius: 2,
                            }}>
                                {player}
                            </Box>

                            {/* Show last move */}
                            <Paper 
                            className='notched'
                            elevation={4}
                            sx={{
                                display: "flex",
                                flexDirection: "row",
                                flexWrap: "wrap",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "50px",
                                p: 1,
                                position: "relative",
                                zIndex: 10,
                            }}>
                                {game.lastMoves[index][0] != -1 &&
                                    <>
                                {game.lastMoves[index][0] == 0 ? "CALL" :
                                <>RAISE {game.lastMoves[index][0]} {game.lastMoves[index][1]}'s</>}</>}
                            </Paper>
                        </Box>
                    ))}
                </Box>
                {/* Show current bid */}
                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-around",
                    p: 1,
                }}>
                    {game.currentBid[1] == -1 ?
                    <>
                        No Bid
                    </>:
                    <>
                        #{game.currentBid[0]} {game.currentBid[1]}'s
                    </>}
                </Box>
                {/* Show dice */}
                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "space-around",
                    flex: 1,
                    p: 1,
                }}>
                    {game.rolls[0].map((die, index) => (
                        <Box key={die + "," + index} sx={{
                            m: 2,
                            p: 1,
                        }}>
                            {getDieElement(die)}
                        </Box>
                    ))}
                </Box>

                {/* Show buttons */}
                {game.currentPlayer == 0 &&
                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                }}>
                    {game.currentBid[1] != -1 &&
                    <Box sx={{
                        borderRadius: 2,
                        border: "1px solid black",
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100px",
                        mr: 4,
                    }}>
                        <Button sx={{
                            m: 0,
                            alignSelf: "center",
                        }} variant="contained" onClick={() => {
                            let newgame = game.copy();
                            console.log(game.currentBid);
                            setBetCount(game.currentBid[0])
                            let actualCount = (game.rolls.map(q => q.filter((x) => x == game.currentBid[1]).length)).reduce((partial, a) => partial+a, 0);
                            setTrueCount(actualCount);
                            setPaused(true);
                            newgame.call();
                            setGame(newgame);
                        }}>Call</Button>

                    </Box>}

                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        flexWrap: "wrap",
                        justifyContent: "space-around",
                        p: 1,
                        width: "400px",
                        border: "1px solid black",
                        borderRadius: 2,
                    }}>
                        <TextField sx={{width: "100px"}} type="number" id="outlined-basic" label="Count" variant="outlined" value={countBid} onChange={(e) => {
                            if (e.target.value < game.currentBid[0])
                                return;
                            if(e.target.value < 1)
                                return;
                            setCountBid(e.target.value);
                        }} />

                        <TextField sx={{width: "100px"}} type="number" id="outlined-basic" label="Number" variant="outlined" value={numberBid} onChange={(e) => {
                            if ((e.target.value < game.currentBid[1] && countBid == game.currentBid[0]) || e.target.value < 1 || e.target.value > 6)
                                return;

                            setNumberBid(e.target.value);
                        }} />
                        
                        <Button variant="contained" onClick={() => {
                            if (countBid > game.currentBid[0] || numberBid > game.currentBid[1]) {
                                makeMove([countBid, numberBid]);
                            }
                        }}>Bid</Button>
                    </Box>
                </Box>}
            </Box>
        </Box>
    );
}

export default LiarsDice;