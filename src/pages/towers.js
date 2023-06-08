import React, { useEffect } from 'react';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { IconButton, TextField, Tooltip } from '@mui/material';
import Navbar from '../navbar';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckIcon from '@mui/icons-material/Check';
import SearchIcon from '@mui/icons-material/Search';
import FaceIcon from '@mui/icons-material/Face';
import Face2Icon from '@mui/icons-material/Face2';
import Face3Icon from '@mui/icons-material/Face3';
import Face4Icon from '@mui/icons-material/Face4';
import Face5Icon from '@mui/icons-material/Face5';
import Face6Icon from '@mui/icons-material/Face6';

import { get, onValue, ref, set, getDatabase } from 'firebase/database';


function Towers(props) {
    const [mode, setMode] = React.useState("lobby");
    const [gameCode, setGameCode] = React.useState("");
    const [playerId, setPlayerId] = React.useState(-1);

    const getPage = () => {
        switch (mode) {
            case "lobby":
                return <LobbyPage setMode={setMode} setGameCode={setGameCode} setPlayer={setPlayerId}/>
            case "game":
                return <GamePage setMode={setMode} gameCode={gameCode} playerId={playerId}/>
            default:
                return <LobbyPage setMode={setMode} setGameCode={setGameCode} setPlayer={setPlayerId}/>
        }
    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            <Navbar/>

            {getPage()}
        </Box>
    );
}

function GamePage(props) {

    const [board, setBoard] = React.useState([]);
    const [players, setPlayers] = React.useState([]);
    const [isActivePlayer, setIsActivePlayer] = React.useState(false);
    const [activePlayer, setActivePlayer] = React.useState(-1);

    const [highlightedPath, setHighlightedPath] = React.useState([]);

    useEffect(() => {
        const db = getDatabase();
        let gameRef = ref(db, 'games/' + props.gameCode);

        onValue(gameRef, (snapshot) => {
            if(snapshot.exists()) {
                const data = snapshot.val();
                setBoard(data.board);
                setPlayers(data.players);
                setActivePlayer(data.curPlayer);

                if (data.curPlayer == props.playerId) {
                    setIsActivePlayer(true);
                } else {
                    setIsActivePlayer(false);
                }
            }
        });


    }, [props.gameCode]);

    const addTile = (x, y) => {
        const db = getDatabase();
        let boardRef = ref(db, 'games/' + props.gameCode + "/board")

        let newBoard = [...board];
        let index = 0;
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i].x == x && newBoard[i].y == y) {
                index = i;
                break;
            }
        }
        newBoard[index].open = false;
        
        //Check which neighbors don't have a tile
        let neighbors = [[x-1, y], [x+1, y], [x, y-1], [x, y+1]];
        for (let i = 0; i < newBoard.length; i++) {
            if (newBoard[i] == null)
                continue;
            let nextNeighbors = [...neighbors];
            for (let i = 0; i < neighbors.length; i++) {
                console.log(newBoard[i])
                if (neighbors[i][0] == newBoard[i].x && neighbors[i][1] == newBoard[i].y) {
                    nextNeighbors.splice(i, 1);
                }
            }
            neighbors = nextNeighbors;
            if (neighbors.length == 0) {
                break;
            }
        }

        console.log(neighbors)

        //Create tiles at neighbors with random chance
        for (let i = 0; i < neighbors.length; i++) {
            if (Math.random() < 0.5) {
                newBoard.push(createTile(0, neighbors[i][0], neighbors[i][1]));
            }
        }

        //Push board updates to remote
        set(boardRef, newBoard);
    }

    const createTile = (floor, x, y) => {
        return {
            floor: floor,
            x: x,
            y: y,
            open: true,
        }
    }

    const getTile = (tile) => {
        let localPlayers = [];
        for (let i = 0; i < players.length; i++) {
            if (players[i].position.x == tile.x && players[i].position.y == tile.y) {
                localPlayers.push({data: players[i], id: i});
            }
        }
        const playerIcons = [
            <FaceIcon/>,
            <Face2Icon/>,
            <Face3Icon/>,
            <Face4Icon/>,
            <Face5Icon/>,
            <Face6Icon/>,
        ]
        let tileLoc = {
            x: tile.x,
            y: tile.y,
        }
        let inPath = highlightedPath.map((pathTile) => {
            return pathTile.x == tileLoc.x && pathTile.y == tileLoc.y;
        }).includes(true);

        let tileColor = inPath ? "green" : "white";

        return (
            <Box sx={{
                width: "80px",
                height: "80px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                m: 1,
                backgroundColor: tileColor,
                cursor: isActivePlayer ? "pointer" : "default",
            }}
            onMouseEnter={() => {
                if (isActivePlayer && !tile.open) {
                    //Check if player is on the current tile
                    if (players[props.playerId].position.x == tile.x && players[props.playerId].position.y == tile.y) {
                        return;
                    } else {
                        //Highlight path
                        let path = getPath(players[props.playerId].position, {x: tile.x, y: tile.y});
                        setHighlightedPath(path);
                    }
                }
            }}
            onMouseLeave={() => {
                setHighlightedPath([]);
            }}
            onClick={() => {
                if (isActivePlayer && !tile.open) {
                    //Set player position to tile
                    let newPlayers = [...players];
                    newPlayers[props.playerId].position.x = tile.x;
                    newPlayers[props.playerId].position.y = tile.y;
                    setPlayers(newPlayers);

                    //Push player updates to remote
                    const db = getDatabase();
                    let playersRef = ref(db, 'games/' + props.gameCode + "/players");
                    set(playersRef, newPlayers);
                } else if (isActivePlayer && tile.open) {
                    //Add tile
                    console.log(tile);
                    addTile(tile.x, tile.y);
                }
            }}
            >
                {(tile.open && isActivePlayer) &&
                <IconButton disabled sx={{
                    flex: 1,
                }}>
                    <SearchIcon/>
                </IconButton>}
                <Box sx={{
                    display: "flex",
                    flexDirection: "row"
                }}>
                    {localPlayers.map((player, index) => {
                        return (
                            <Tooltip title={player.data.name}>
                                {playerIcons[player.id]}
                            </Tooltip>
                        )
                    })}
                </Box>
            </Box>
        )
    }

    const getPath = (start, end) => {

        //Convert board to 2d array of size (20x20)
        let board2d = [];
        for (let i = 0; i < 20; i++) {
            let row = [];
            for (let j = 0; j < 20; j++) {
                row.push({x: i, y: j, cost: Infinity, prev: null});
            }
            board2d.push(row);
        }

        //10, 10 is the center of the board

        //Set all tiles to 1
        for (let i = 0; i < board.length; i++) {
            board2d[board[i].x + 10][board[i].y + 10] = {x: board[i].x + 10, y: board[i].y + 10, cost: 1, prev: null};
        }

        start = {
            x: start.x + 10,
            y: start.y + 10,
        }

        end = {
            x: end.x + 10,
            y: end.y + 10,
        }

        //Calculate path
        let queue = [];
        let visited = [];
        queue.push(board2d[start.x][start.y]);
        while (queue.length > 0) {
            let current = queue.shift();
            if (current.x == end.x && current.y == end.y) {
                break;
            }
            let neighbors = [[current.x-1, current.y], [current.x+1, current.y], [current.x, current.y-1], [current.x, current.y+1]];
            for (let i = 0; i < neighbors.length; i++) {
                if (neighbors[i][0] < 0 || neighbors[i][0] > 19 || neighbors[i][1] < 0 || neighbors[i][1] > 19) {
                    continue;
                }
                if (visited.includes(board2d[neighbors[i][0]][neighbors[i][1]])) {
                    continue;
                }
                if (board2d[neighbors[i][0]][neighbors[i][1]].cost == Infinity) {
                    continue;
                } else {
                    board2d[neighbors[i][0]][neighbors[i][1]].prev = current;
                    board2d[neighbors[i][0]][neighbors[i][1]].cost = current.cost + 1;
                    queue.push(board2d[neighbors[i][0]][neighbors[i][1]]);
                }
            }
            visited.push(current);
        }

        //Get path
        let path = [];
        let current = board2d[end.x][end.y];
        while (current.prev != null) {
            path.push(current);
            current = current.prev;
        }

        path.reverse();

        for (let i = 0; i < path.length; i++) {
            path[i] = {x: path[i].x - 10, y: path[i].y - 10};
        }

        return path;
    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            {/* Player Information Bar */}
            <Box sx={{ display: "flex", width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "row", marginTop: "10px", gap: "10px" }}>
                {players.map((player, index) => {
                    return (
                        <Paper sx={{
                            p: 1,
                            border: (index == activePlayer) ? "2px solid black" : "",
                        }}
                        key={player.name}
                        elevation={index == activePlayer ? 5: 1}
                        >
                            {player.name}
                        </Paper>
                    )
                })}
            </Box>

            {/* Board Display */}
            <Box sx={{
                display: "flex",
                width: "80vw",
                height: "80vh",
                position: "relative",
            }}>
                {board.map((tile, tileIndex) => {
                    return (
                        <Paper sx={{
                            width: "100px",
                            height: "100px",
                            position: "absolute",
                            top: tile.x * 100,
                            left: tile.y * 100,
                        }}>
                            {getTile(tile)}
                        </Paper>
                    )
                })}
            </Box>

        </Box>
    )
}

function LobbyPage(props) {
    const [lobbyCode, setLobbyCode] = React.useState("");
    const [inLobby, setInLobby] = React.useState(false);
    const [playerName, setPlayerName] = React.useState("");

    const [nameError, setNameError] = React.useState("");
    const [lobbyError, setLobbyError] = React.useState("");

    const [players, setPlayers] = React.useState([]);

    const [chat, setChat] = React.useState([]);

    const [chatMessage, setChatMessage] = React.useState("");
    const [chatLength, setChatLength] = React.useState(0);

    const [ready, setReady] = React.useState(false);


    const tryJoinLobby = async () => {
        let failed = false;
        if(playerName == "") {
            setNameError("Name cannot be empty");
            failed = true;
        }
        if(lobbyCode == "") {
            setLobbyError("Lobby code cannot be empty");
            failed = true;
        }
        if(failed) return;

        const db = getDatabase();
        const lobbyRef = ref(db, 'lobbies/' + lobbyCode);


        await get(lobbyRef).then(async (snapshot) => {
            if(snapshot.exists()) {
                const data = snapshot.val();
                if (data.started) {
                    //Game has already started
                    
                    //Get player Id from game information

                    const gamePlayerRef = ref(db, 'games/' + lobbyCode + "/" + "players");
                    let info = await get(gamePlayerRef).then((snapshot) => {
                        if(snapshot.exists()) {
                            const data = snapshot.val();
                            return data;
                        }
                    });

                    for (let i = 0; i < info.length; i++) {
                        if (info[i].name == playerName) {
                            props.setPlayer(i);
                            break;
                        }
                    }

                    //Navigate to game
                    props.setMode("game")
                    props.setGameCode(lobbyCode);
                }

                if(data.players.length >= 4) {
                    setLobbyError("Lobby is full");
                    return;
                }
                let found = false;
                let index = 0;
                for(let i = 0; i < data.players.length; i++) {
                    if(data.players[i].name == playerName) {
                        found = true;
                        index = i;
                        break;
                    }
                }
                props.setPlayer(index);
                if(found) {
                    //Player is rejoining

                }else {
                    const playersRef = ref(db, 'lobbies/' + lobbyCode + "/" + "players");
                    set(playersRef, {
                        ...data.players,
                        [data.players.length]: {name: playerName, ready: false}
                    });
                }
                setInLobby(true);
                startListener(lobbyCode);
            } else {
                setLobbyError("Lobby does not exist");
            }
        });
    }

    const createLobby = async () => {
        let failed = false;
        if(playerName == "") {
            setNameError("Name cannot be empty");
            failed = true;
        }
        if(failed) return;

        const db = getDatabase();

        const genCode = (length) => {
            let result = "";
            const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            for(let i = 0; i < length; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        }

        let code = genCode(4);
        const lobbyRef = ref(db, 'lobbies/' + code);
        //Check if lobby already exists
        let exists = true;
        while(exists) {
            await get(lobbyRef).then((snapshot) => {
                if(snapshot.exists()) {
                    code = genCode(4);
                } else {
                    exists = false;
                }
            });
        }

        setLobbyCode(code);

        set(lobbyRef, {
            players: {
                0: {
                    "name": playerName,
                    "ready": false
                }
            },
            playerCount: 1,
            chatLength: 1,
            chat: {
                0: {
                    "sender": "server",
                    "message": "Welcome to Towers"
                }
            }
        });

        setInLobby(true);
        startListener(code);
    }

    const startListener = (code) => {
        const db = getDatabase();
        const lobbyRef = ref(db, 'lobbies/' + code);
        onValue(lobbyRef, (snapshot) => {
            const data = snapshot.val();
            if(data == null) {
                setInLobby(false);
                return;
            }
            setPlayers(data.players);


            setChat(data.chat);
            setChatLength(data.chatLength);

            if(data.started) {
                props.setMode("game");
                props.setGameCode(code);
            }
        });

    }

    const sendMessage = () => {
        const db = getDatabase();
        const chatRef = ref(db, 'lobbies/' + lobbyCode + "/" + "chat");

        set(chatRef, {
            ...chat,
            [chatLength]: {
                "sender": playerName,
                "message": chatMessage
            }
        });

        const chatLengthRef = ref(db, 'lobbies/' + lobbyCode + "/" + "chatLength");
        set(chatLengthRef, chatLength + 1);

        setChatMessage("");
    }

    const readyUp = () => {
        setReady(!ready);

        const db = getDatabase();
        const playersRef = ref(db, 'lobbies/' + lobbyCode + "/" + "players");
        let index = -1;
        for(let i = 0; i < players.length; i++) {
            if(players[i].name == playerName) {
                index = i;
                break;
            }
        }
        if (index == -1) {
            console.log(players)
            console.log("Error: Player not found")
            return;
        }
        set(playersRef, {
            ...players,
            [index]: {
                "name": playerName,
                "ready": !ready
            }
        });
    }

    const startGame = () => {
        console.log("Starting game")

        const db = getDatabase();
        const lobbyRef = ref(db, 'lobbies/' + lobbyCode);
        set(lobbyRef, {
            "started": true
        });

        //Create game
        const gameRef = ref(db, 'games/' + lobbyCode);

        for (let i = 0; i < players.length; i++) {
            players[i].position = {
                x: 0,
                y: 0
            }
        }
        set(gameRef, {
            "players": players,
            board: {
                0: {
                    x: 0,
                    y: 0,
                    neighbors: {},
                    open: true
                }
            },
            curPlayer: 0,

        });

        props.setMode("game")
        props.setCode(lobbyCode)
    }

    return (
        <Box sx={{
            display: "flex",
            width: "100%",
            height: "100%",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
        }}>
            <Box sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                maxWidth: "700px",
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column"
            }}>
                Game Settings
            </Box>

            <Box sx={{
                display: "flex",
                width: "100%",
                height: "100%",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                width: {
                    xs: "100%",
                    sm: "400px",
                }
            }}>
                <Typography variant="h5" component="div">
                    Lobby
                </Typography>
                {!inLobby &&
                <Box sx={{gap: "10px", display: "flex", flexDirection: "column", width: "100%"}}>
                    <TextField sx={{width: "100%"}} id="outlined-basic" label="Player Name" variant="outlined" value={playerName} onChange={(e) => 
                        {
                            setPlayerName(e.target.value)
                            setNameError("")
                        }}
                        error={nameError} helperText={nameError}/>
                    <TextField sx={{width: "100%"}} id="outlined-basic" label="Lobby Code" variant="outlined" value={lobbyCode} onChange={(e) => 
                        {
                            setLobbyCode(e.target.value)
                            setLobbyError("")
                        }} 
                        error={lobbyError} helperText={lobbyError}/>

                    <Button sx={{width: "100%"}} variant="contained" onClick={tryJoinLobby}>Join Lobby</Button>
                    <Button sx={{width: "100%"}} variant="contained" onClick={createLobby}>Create Lobby</Button>
                </Box>}

                {inLobby &&
                <Box sx={{gap: "10px", display: "flex", flexDirection: "column", width: "100%"}}>
                    <Typography variant="h6" component="div" sx={{textAlign: "center"}}>
                        {lobbyCode}
                    </Typography>
                    <Typography variant="h6" component="div">
                        Players
                    </Typography>

                    {Object.keys(players).map((key) => {
                        return <Paper sx={{
                            width: "100%",
                            padding: "10px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}>
                            {players[key].name}
                            {players[key].ready && <CheckIcon sx={{marginLeft: "10px"}}/>}
                        </Paper>
                    })}
                    
                    <Typography variant="h6" component="div">
                        Chat
                    </Typography>

                    {chat && <Box sx={{display: "flex", flexDirection: "column", gap: "10px", height: "400px", overflowX: "auto"}}>
                        
                        {chat.map((message) => {
                            if (message.sender == playerName)
                            {
                                //Float right
                                return <Paper sx={{
                                    maxWidth: "80%",
                                    padding: "10px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    alignSelf: "flex-end",
                                    backgroundColor: "secondary.main",
                                    color: "white",
                                }}>
                                    {message.message}
                                </Paper>

                            } else {      
                                return (
                                <Tooltip title={message.sender} placement="left">
                                    <Paper sx={{
                                        maxWidth: "80%",
                                        padding: "10px",
                                        display: "flex",
                                        alignItems: "flex-start",
                                        justifyContent: "left",
                                    }}>
                                        <div style={{
                                            marginRight: "10px",
                                            fontWeight: "bold",
                                        }}>{message.sender}: </div>
                                        <div>{message.message}</div>
                                    </Paper>
                                </Tooltip>)
                            }
                        })}
                    </Box>}

                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        gap: "10px",
                    }}>
                        <TextField sx={{flex: 1}} id="outlined-basic" label="Message" variant="outlined" value={chatMessage} onChange={(e) =>
                            {
                                setChatMessage(e.target.value)
                            }} onKeyDown={(e) => {
                                if(e.key == "Enter") {
                                    sendMessage();
                                }
                            }}/>
                        <Button sx={{width: "50px"}} variant="contained" onClick={sendMessage}>Send</Button>
                    </Box>
                    
                    <Button sx={{width: "100%"}} variant="contained" onClick={readyUp}>
                        {ready ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>}
                        {ready ? "Unready" : "Ready"}
                    </Button>
                    <Button sx={{width: "100%"}} variant="contained" onClick={startGame}
                    disabled = {Object.keys(players).length < 2 ||
                        Object.keys(players).some((key) => {
                            return !players[key].ready;
                        })
                    }
                    >
                        Start Game
                    </Button>
                </Box>


                }
            </Box>
        </Box>
    )
}

export default Towers;