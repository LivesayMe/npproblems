import React, { useEffect } from 'react';
import { Box, Button, Card, CardActionArea, CardActions, CardContent, CardMedia, Container, Grid, Modal, Paper, Stack, Typography } from '@mui/material';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import {UnoGame, copyGame} from './uno_logic';
import Navbar from '../navbar';

function Uno(props) {
    const [game, setGame] = React.useState(null);
    const [playerCount, setPlayerCount] = React.useState(2);
    const [drawModalOpen, setDrawModalOpen] = React.useState(false);
    const [gameOver, setGameOver] = React.useState(false);
    const [wildModalOpen, setWildModalOpen] = React.useState(false);
    const [wildCard, setWildCard] = React.useState(null);

    useEffect(() => {
        if (game === null) {
            let game = new UnoGame(playerCount);

            setGame(game);
        }
    }, []);

    useEffect(() => {
        if (game === null) {
            return;
        }

        if (game.getAvailableMoves().length === 1 && game.getAvailableMoves()[0] === -1) {
            if (game.currentPlayer == 0 && game.gameOver === false)
            {
                // setDrawModalOpen(true);
                console.log("Must Draw")
            }
        }

        if(game.currentPlayer != 0 && !game.gameOver) {
            //Make random AI move after 1 second
            setTimeout(() => {
                let moves = game.getAvailableMoves();
                let move = moves[Math.floor(Math.random() * moves.length)];
                let copy = copyGame(game);
                let result = copy.makeMove(move);
                if (result) {
                    setGameOver(true);
                }
                setGame(copy);
            }, 1000);
        }
    }, [game]);

    const cardColor = (card) => {
        if(card == null)
        {
            return "white";
        }
        //If not wild return card.color
        if (card.wild == undefined) {
            return card.color;
        }

        
        if (card.color == undefined)
        {
            //4 way gradient between the 4 colors
            return "linear-gradient(45deg, red 25%, yellow 25%, yellow 50%, green 50%, green 75%, blue 75%)";
        }
        //Return a gradient between the card color and white
        return "linear-gradient(45deg, " + card.color + " 30%, white 90%)";
    }

    const cardTextColor = (card) => {
        //If Yellow or Red return black
        if (card.color === "yellow" || card.color === "red") {
            return "black";
        }
        return "white";
    }

    const cardText = (card) => {
        //If has number return number
        if (card.number != null) {
            return card.number;
        }

        //If card has special return special
        if (card.special) {
            switch(card.special) {
                case "skip":
                    return "Skip";
                case "reverse":
                    return "Reverse";
                case "draw2":
                    return "Draw 2";
            }
        }

        //If card has wild return wild
        if (card.wild) {
            switch(card.wild) {
                case "wild":
                    return "Wild";
                case "wild4":
                    return "Wild Draw 4";
            }
        }
    }

    const renderCard = (card, index, isDiscard = false) => {
        const isPlayable = game.canPlayCard(0, index);
        const borderAnim = isPlayable ? "5px solid #00ff00" : "none";

        return (
            <Paper 
            key={card.id}
            elevation={3}
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                p: 1,
                m: 1,
                background: cardColor(card),
                color: cardTextColor(card),
                textAlign: "center",
                width: "100px",
                height: "200px",
                userSelect: "none",
                cursor: (!isDiscard && isPlayable) ? "pointer" : "default",
                "&:hover": {
                    boxShadow: isPlayable ? 20 : 3,
                },
                //Shiny animated border if playable
                // border: borderAnim,
                // transition: "border 0.5s",
                // animation: borderAnim === "none" ? "none" : "$borderAnim 1s infinite",


            }}
            onClick={() => {
                if (isDiscard) {
                    return;
                }
                if (isPlayable){
                    if (card.wild) {
                        setWildCard(index);
                        setWildModalOpen(true);
                        return;
                    }
                    let copy = copyGame(game);
                    let result = copy.playCard(0, index);
                    if (result) {
                        setGameOver(true);
                    }
                    setGame(copy);
                }
            }}
            >
                <Typography variant="h6" component="div">
                    {cardText(card)}
                </Typography>
            </Paper>
        )
    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            <Modal open={drawModalOpen}>
                <Box sx={{ display: "flex", flexGrow: 1, width: "100%", height: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
                    <Card sx={{ maxWidth: 345 }}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Draw a card
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" onClick={() => {
                                let copy = copyGame(game);
                                copy.dealCard(0);
                                copy.currentPlayer = copy.nextPlayer();
                                setGame(copy);
                                setDrawModalOpen(false);
                            }}>Draw</Button>
                        </CardActions>
                    </Card>
                </Box>
            </Modal>
            
            {game &&
            <Modal open={gameOver}>
                <Box sx={{ display: "flex", flexGrow: 1, width: "100%", height: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
                    <Card sx={{ maxWidth: 345 }}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Game Over Player {game.getWinner() + 1} won!
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Play again?
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <Button size="small" onClick={() => {
                                setGame(new UnoGame(playerCount));
                                setGameOver(false);
                            }}>Yes</Button>
                            <Button size="small" onClick={() => {
                                setGameOver(false);
                            }}>No</Button>
                        </CardActions>
                    </Card>
                </Box>
            </Modal>}

            {game &&
            <Modal open={game.currentPlayer == 0 && wildModalOpen}>
                <Box sx={{ display: "flex", flexGrow: 1, width: "100%", height: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
                    <Card sx={{ maxWidth: 345 }}>
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Choose a color
                            </Typography>
                        </CardContent>
                        <CardActions>
                            {["red", "blue", "green", "yellow"].map((color) => {
                                return (
                                    <Button size="small" onClick={() => {
                                        let copy = copyGame(game);
                                        let result = copy.playCard(0, wildCard, color);
                                        setWildModalOpen(false);
                                        if (result) {
                                            setGameOver(true);
                                        }
                                        setGame(copy);
                                    }}>{color}</Button>
                                )
                            })}
                        </CardActions>

                    </Card>
                </Box>
            </Modal>}

            <Navbar/>

            {/* Main content, white */}
            <Box sx={{ display: "flex", flexGrow: 1, width: {xs: "100%", lg: "800px"},
                       alignItems: "center",  justifyContent: "center", 
                       flexDirection: "column", bgcolor: "background.paper" }}>
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
                        value={playerCount}
                        exclusive
                        onChange={(e, newvalue)=>{
                            setPlayerCount(newvalue);
                            setGame(new UnoGame(newvalue));
                            console.log(newvalue)
                        }}
                        aria-label="player count"
                        
                    >
                        <ToggleButton value={2} aria-label="2 players">
                            2 Players
                        </ToggleButton>
                        <ToggleButton value={3} aria-label="3 players">
                            3 Players
                        </ToggleButton>
                        <ToggleButton value={4} aria-label="4 players">
                            4 Players
                        </ToggleButton>
                        <ToggleButton value={5} aria-label="5 players">
                            5 Players
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>
                {/* Other Player Hands Count */}
                <Box sx={{ 
                    display: 
                    "flex", 
                    flexGrow: 1, 
                    width: "100%",
                    alignItems: "center",  
                    justifyContent: "space-evenly", 
                    flexDirection: "row", 
                    bgcolor: "background.paper",
                    borderRadius: "5px",
                    boxShadow: 1
                }}>
                    {game && Array.from(Array(playerCount).keys()).map((i) => {
                        return (
                            <Box sx={{
                                border: game.currentPlayer === i ? "2px solid black" : "none",
                                borderRadius: "5px",
                                p: 1,
                            }}>
                                Player {i + 1}: 
                                {game.getHand(i).length}
                            </Box>
                        )
                    })}
                </Box>

                {/* Discard Pile */}
                <Box sx={{ display: "flex", flexGrow: 1, flex: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "row", bgcolor: "background.paper" }}>
                    {game && <>{renderCard(game.getDiscard(), -1, true)}</>}
                </Box>
                
                {/* Draw Button */}
                <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "row", bgcolor: "background.paper",
                                
            }}>
                    {game && <Button 
                    sx = {{
                        border: (game.getAvailableMoves().length === 1 && game.getAvailableMoves()[0] === -1 && game.currentPlayer === 0 && !game.gameOver) ? "5px solid red" : "none",
                    }}
                    variant="contained" onClick={() => {
                        let copy = copyGame(game);
                        copy.dealCard(0);
                        copy.currentPlayer = copy.nextPlayer();
                        setGame(copy);
                    }}>Draw</Button>}
                </Box>

                {/* Player Hand */}
                <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "row", bgcolor: "background.paper" }}>
                    {game && <>
                        {game.getHand(0).map((card, index) => {
                            return renderCard(card, index);
                        })}
                    </>}
                </Box>
            </Box>
            
        </Box>
    );
}

export default Uno;