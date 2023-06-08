import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import img1 from "./content/Screenshot 2023-03-28 113806.png";
import img2 from "./content/Screenshot 2023-03-28 114811.png";
import img3 from "./content/Screenshot 2023-03-28 115022.png";
import img4 from "./content/Screenshot 2023-03-28 115129.png";
import img5 from "./content/Screenshot 2023-03-28 115235.png";
import ReactAudioPlayer from 'react-audio-player';
import React from "react";
let memeories = {
    "title": "Using Firebase Realtime Database for remote multiplayer games",
    "categories": [
        "Web Development",
        "Firebase",
        "Games"
    ],
    id: 3,
    "body": {
        "type": "markdown",
        "content": (
            <Box>
                <Typography variant="h4">
                    Introduction
                </Typography>
                <Typography variant="body1">
                    Recently I've been working on a project called Making Memeories, which is now live and can be played <a href="https://makingmemeories.com" style={{display: "inline-block"}}>here</a>. Although it only has my family's photos on it.
                    The idea was to create a mixture of the games "Quiplash" and "What do you meme?" that could be played remotely, and used photos from a personal family photo album. While making the project needlessly complicated, I also wanted it to be able to scale to many players in one room, and having multiple rooms going at the same time.
                    The latter goal necessitated lobby functionality.
                </Typography>

                <Typography variant="h4">
                    How the game works
                </Typography>

                <Typography variant="body1">
                    One client (designated the host) displays the game state. All players connect via their personal device. 
                    <br/>
                    <img src={img2} width="300px"/>
                    <br/>
                    At each round, one player is selected as "king" and selects from one of 3 randomly selected photos. 
                    <br/>
                    <img src={img3} width="300px"/>
                    <br/>
                    The host then displays the photo, and all other players fill in a caption, which once again are displayed by the host. 
                    <br/>
                    <img src={img4} width="300px"/>
                    <br/>
                    The king then picks one of the captions (Apples to Apples style) as the winner. The player who wrote the winning caption is awarded 1 point. The first player to 9 points wins.
                    <br/>
                    <img src={img5} width="300px"/>
                    <br/>
                    The main complexity in building it is ensuring that all players displays are in sync, and update quickly. From past experience if it takes more than .5s for it to update, the user will think it is broken and start clicking things randomly which will break it. I solved these issues with Firebase Realtime Database.
                </Typography>

                <Typography variant="h4">
                    Firebase Realtime Database
                </Typography>

                <Typography variant="body1">
                    Firebase Realtime Database is a NoSQL database that is hosted by Google. The entire database is stored as a JSON-like object, and can be accessed by any client. The database is updated in real time, so any changes made by one client are immediately reflected in the database. Clients can also subscribe to changes in the database, so they can be notified when a change occurs.
                    <br/> 
                    The design paradigm of Realtime Database means that there are no arrays, which took me some time to get used to. I ended up treating dictionaries as arrays, and iterating over their keys. I suspect that there is a better way to use it.
                    <br/>
                    The structure of a game is as follows:
                    <br/>
                    <img src={img1}/>
                    <br/>
                    The players object stores all players joined to the game, and activePlayer stores information about the current round. imageSet stores the id of the set of images to be used. While initially I did just intend it to be used by my family, I also had aspirations of expanding it so that any user could upload their own image set.
                    <br/>
                    Each client subscribes to the activePlayer object, and updates their ui accordingly. Once a winning caption has been selected, the host resets the activePlayer object.
                </Typography>

                <Typography variant="h4">
                    Reflections
                </Typography>

                <Typography variant="body1">
                    There isn't anything actually complicated going on for the project. It's incredibly simple. Altogether, there is only about 2000 lines of code.
                    <br/>
                    The most difficult part of the project was handling lobbies. It needed to be very simply so anyone, even people with next to no technical skills could join quickly, but still needed to be robust enough to handle multiple games going on at the same time. I'm quite happy with the innovation of embedding a qr code for the lobby itself, I think that makes it much easier to join.
                    <br/>
                    What has been interesting to see is how well it was received  by people. It was a big wake up call to me, that just because a project is more technically complicated, bigger, and at least to me more interesting, doesn't mean that it will be better to actually users. I think we as developers tend to get caught up in the technical aspects of a project, and forget that the most important thing is that it is useful to the user.
                </Typography>
            </Box>
        )
    }
}

export default memeories;