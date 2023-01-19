import { Box } from '@mui/system';
import React from 'react';
import { Card, CardActions, CardContent, Stack, Button, Typography } from '@mui/material';



function App() {
  let games = [
    {
      name: "Corral",
      image: "./images/corral.png",
      url: "/corral"
    },
    {
      name: "Tic Tac Toe",
      image: "./images/tictactoe.png",
      url: "/tictactoe"
    },
    {
      name: "Masyu",
      image: "./images/masyu.png",
      url: "/masyu"
    },
    {
      name: "N-Queens",
      image: "./images/nqueens.png",
      url: "/nqueens"
    },
    {
      name: "Bulls and Cows",
      image: "./images/bullscows.png",
      url: "/bullscows"
    },
    {
      name: "Blocks",
      image: "./images/blocks.png",
      url: "/blocks"
    }
  ]
  return (
    <div className="App">
      {/*Navigation panel, image of each game on paper, mui*/}
      <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', alignItems: 'center', alignContent: 'center', p: 1, m: 1, bgcolor: 'background.paper' }}>
        {games.map((game) => (
          <a href={game.url} style={
            {
              textDecoration: 'none',
            }
          }>
            <Card sx={{ 
              minWidth: 275, maxWidth: 275, m: 1, p: 1,
              '&:hover': {
                boxShadow: 6,
              },
              }}>
              <CardContent>
                <img src={game.image} alt={game.name} style={{
                  width: '100%',
                  height: 'auto',
                }}/>
              </CardContent>
              <CardActions>
                <Stack direction="row" spacing={2}>
                  <Typography variant="h5" component="div">
                    {game.name}
                  </Typography>
                </Stack>
              </CardActions>
            </Card>
          </a>
        ))}
      </Box>

    </div>
  );
}

export default App;
