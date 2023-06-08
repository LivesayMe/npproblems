import React, { useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";

class TicTacToe_Logic {

    constructor() {
        this.board = new Array(9).fill(0);
        this.player = "X";
        this.winner = null;
    }

    getAvailableMoves(player = this.player) {
        let moves = [];
        for (let i = 0; i < this.board.length; i++) {
            if (this.board[i] === 0) {
                moves.push(i);
            }
        }
        return moves;
    }

    makeMove(move, player = this.player) {
        if (this.board[move] !== 0) {
            return false;
        }
        this.board[move] = player;
        this.player = player === "X" ? "O" : "X";
        if (this.checkWin()) {
            return true;
        }
        return true;
    }

    checkWin() {
        let winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for (let i = 0; i < winConditions.length; i++) {
            let [a, b, c] = winConditions[i];
            if (this.board[a] === this.board[b] && this.board[b] === this.board[c] && this.board[a] !== 0) {
                this.winner = this.board[a];
                return true;
            }
        }
        // Check for draw
        if (this.board.filter((x) => x === 0).length === 0) {
            this.winner = "draw";
            return true;
        }

        return false;
    }

    getWinningTiles() {
        let winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for (let i = 0; i < winConditions.length; i++) {
            let [a, b, c] = winConditions[i];
            if (this.board[a] === this.board[b] && this.board[b] === this.board[c] && this.board[a] !== 0) {
                return [a, b, c];
            }
        }
        return [];
    }


    reset() {
        this.board = new Array(9).fill(0);
        this.player = "X";
        this.winner = null;
    }

    copy() {
        let copy = new TicTacToe_Logic();
        copy.board = this.board.slice();
        copy.player = this.player;
        copy.winner = this.winner;
        return copy;
    }
}

class MCTS_Node {
    constructor(state, parent = null, move=null) {
        this.state = state;
        this.parent = parent;
        this.children = [];
        this.move = move;
        this.visits = 0;
        this.wins = 0;
    }

    getUCB() {
        if (this.visits === 0) {
            return Infinity;
        }
        if(this.parent === null) {
            return this.wins / this.visits;
        }
        return (this.state.player === "X" ? (this.visits-this.wins) : this.wins) / this.visits + Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);
    }

    getBestChild() {
        let bestChild = null;
        let bestUCB = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            let childUCB = child.getUCB();
            if (childUCB > bestUCB) {
                bestUCB = childUCB;
                bestChild = child;
            }
        }
        return bestChild;
    }

    getUnvisitedChild() {
        let availableMoves = this.state.getAvailableMoves();
        for (let i = 0; i < availableMoves.length; i++) {
            let move = availableMoves[i];
            let child = this.children.find(child => child.state.board[move] !== this.state.board[move]);
            if (child === undefined) {
                return move;
            }
        }
        return null;
    }

    getBestMove() {
        let bestMove = null;
        let bestWins = -Infinity;
        for (let i = 0; i < this.children.length; i++) {
            let child = this.children[i];
            if (child.wins > bestWins) {
                bestWins = child.wins;
                bestMove = child.state.board.findIndex((tile, index) => tile !== this.state.board[index]);
            }
        }
        return bestMove;
    }

    rollout() {
        let state = this.state.copy();
        while (state.winner === null) {
            let availableMoves = state.getAvailableMoves();
            let move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            state.makeMove(move);
        }
        return [this.state, state];
    }

    backpropagate(score) {
        let node = this;
        while (node !== null) {
            node.visits++;
            node.wins += score;
            node = node.parent;
        }
    }

    expand() {
        //If the node has never been visited, pick a random move and make it
        if (this.visits === 0) {
            return this;
        }


        //If the node is terminal
        if(this.winner != null) {
            return this;
        } else {
            if (this.state.checkWin()) {
                return this;
                this.state.winner = this.state.winner;
            }
        }


        let moves = this.state.getAvailableMoves();
        for (let i = 0; i < moves.length; i++) {
            let move = moves[i];
            let newState = this.state.copy();
            newState.makeMove(move);
            let newNode = new MCTS_Node(newState, this, move);
            this.children.push(newNode);
        }

        if(this.children.length === 0) {
            return this;
        }

        //Pick one at random
        let randomChild = this.children[Math.floor(Math.random() * this.children.length)];
        return randomChild;
    }

    select() {
        let node = this;
        while (node.children.length > 0) {
            node = node.getBestChild();
        }
        return node;
    }
}

function MiniMax_TicTacToe(props) {
    const [game, setGame] = useState(new TicTacToe_Logic());
    const [winningTiles, setWinningTiles] = useState([]);

    const [gameTree, setGameTree] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        //Calculate true win percentage for every state, calculated via MiniMax
        let winPercentage = {};

        let root = { state: game.copy(), children: [], score: 0, parent: null, move: null };

        const minimax = (node, isMaximizing) => {
            if (node.state.winner !== null) {
                
                if (node.state.winner === "X") {
                    node.score = 1;
                } else if (node.state.winner === "O") {
                    node.score = -1;
                } else {
                    node.score = 0;
                }
                return node.score;
            }

            let availableMoves = node.state.getAvailableMoves();
            for (let i = 0; i < availableMoves.length; i++) {
                let move = availableMoves[i];
                let child = { state: node.state.copy(), children: [], score: 0, parent: node, move: availableMoves[i] };
                child.state.makeMove(move);
                node.children.push(child);
                minimax(child, !isMaximizing);
            }

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (let i = 0; i < node.children.length; i++) {
                    let child = node.children[i];
                    if (child.score > bestScore) {
                        bestScore = child.score;
                    }
                }
                node.score = bestScore;
            } else {
                let bestScore = Infinity;
                for (let i = 0; i < node.children.length; i++) {
                    let child = node.children[i];
                    if (child.score < bestScore) {
                        bestScore = child.score;
                    }
                }
                node.score = bestScore;
            }

            return node.score;
        }

        minimax(root, true);

        setGameTree(root);
        setSelectedNode(root);
    }, [])

    useEffect(() => {
        if (game.winner !== null) {
            setWinningTiles(game.getWinningTiles());
        }
    }, [game])

    useEffect(() => {
        setGame(new TicTacToe_Logic());
        setWinningTiles([]);
    }, [props.reset])

    useEffect(() => {
        //Set game to selected node
        if (selectedNode !== null) {
            setGame(selectedNode.state);
            setWinningTiles(selectedNode.state.getWinningTiles());
        }
    }, [selectedNode])
    
    const makeMove = (move) => {
        if (game.winner !== null) {
            return;
        }
        let new_game = game.copy();
        new_game.makeMove(move);

        //Find the child node that matches the new game state
        let child = selectedNode.children.find(child => child.state.board[move] !== selectedNode.state.board[move]);
        if (child !== undefined) {
            setSelectedNode(child);
        }

        setGame(new_game);
    }

    const getLetter = (tile) => {
        if (tile === 0) {
            return "";
        }
        return tile;
    }

    const getStrikeThrough = (tile) => {
        if (winningTiles.includes(tile)) {
            return "line-through";
        }
        return "none";
    }

    const getStateTile = (node) => {
        if (node === null) {
            return null;
        }
        let color = "primary.main";
        let hoverColor = "primary.dark";
        if (node == selectedNode) {
            color = "secondary.main";
            hoverColor = "secondary.dark";
        }
        return (
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: color,
                borderRadius: "5px",
                width: "110px",
                minWidth: "110px",
                cursor: "pointer",
                userSelect: "none",
                p: 1,
                m: "2px",
                '&:hover': {
                    bgcolor: hoverColor,
                }
            }} onClick={() => {
                setSelectedNode(node)
            }}>
                {node.move != null ?
                    <Typography variant="body1" sx={{
                    }}>
                        ({node.move % 3 + 1}, {Math.floor(node.move / 3) + 1})
                    </Typography> :
                    <Typography variant="body1" sx={{
                    }}>
                        Root
                    </Typography>
                }
                <Typography variant="body1" sx={{
                }}>
                    Value: {node.score}
                </Typography>
            </Box>
        )
    }


    return (
        <Box sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            width: "80vw",
        }}>
            {Board()}
            <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-around",
                    width: "60px",
                    height: "300px",
                    ml: 6,
                }}>
                    {selectedNode && selectedNode.parent && <div style={{height: "20px", textAlign: "center", marginBottom: "50px"}}>Parent State</div>}
                    {selectedNode && <div style={{height: "20px", textAlign: "center", marginBottom: "50px"}}>Selected State</div>}
                    {selectedNode && selectedNode.children.length > 0 && <div style={{height: "20px", textAlign: "center", marginBottom: "50px"}}>Children States</div>}
                </Box>
            {gameTree && 
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "space-around",
                // maxWidth: "500px",
                flex: 1,
                width: "100%",
                p: 2,
                overflowX: "auto",
                height: "300px",
            }}>
                {selectedNode && selectedNode.parent && getStateTile(selectedNode.parent)}
                {getStateTile(selectedNode)}
                <Box sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    userSelect: "none",
                }}>
                    {selectedNode.children.map((child, i) => {
                        return (<div key={child.score + "," + i}>
                            {getStateTile(child)}
                        </div>);
                    })}
                </Box>
            </Box>}
        </Box>
    )

    function Board() {
        return <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            {Array(3).fill(0).map((_, i) => {
                return (
                    <Box
                    key={"row" + i}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                    }}>
                        {Array(3).fill(0).map((_, j) => {
                            return (
                                <Box 
                                key={"tile" + i + j}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 75,
                                    height: 75,
                                    color: "white",
                                    bgcolor: "primary.main",
                                    borderRadius: 5,
                                    cursor: "pointer",
                                    userSelect: "none",
                                    m: "2px",
                                    textDecoration: getStrikeThrough(i * 3 + j),
                                    '&:hover': {
                                        bgcolor: "primary.dark",
                                    }
                                }} onClick={() => makeMove(i * 3 + j)}>
                                    <Typography variant="h2">
                                        {getLetter(game.board[i * 3 + j])}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}

            <Button variant="contained" sx={{ mt: 2 }} onClick={() => { setGame(new TicTacToe_Logic()); setWinningTiles([]); setSelectedNode(gameTree);} }>
                Reset
            </Button>
        </Box>;
    }
}


function MCTS_TicTacToe(props) {
    const [game, setGame] = useState(new TicTacToe_Logic());
    const [winningTiles, setWinningTiles] = useState([]);

    const [selectedNode, setSelectedNode] = useState(null);

    const [step, setStep] = useState(0);
    const steps = ["Selection", "Expansion", "Rollout", "Backpropagation"];

    const [mctsNode, setMCTSNode] = useState(null);

    const [message, setMessage] = useState("");

    const [nextUpdateNode, setNextUpdateNode] = useState(null);

    useEffect(() => {
        let root = new MCTS_Node(game.copy(), null);
        setMCTSNode(root);
        setSelectedNode(root);
    }, [])

    useEffect(() => {
        if (game.winner !== null) {
            setWinningTiles(game.getWinningTiles());
        }
    }, [game])

    useEffect(() => {
        setGame(new TicTacToe_Logic());
        setWinningTiles([]);
    }, [props.reset])

    useEffect(() => {
        //Set game to selected node
        if (selectedNode !== null) {
            setGame(selectedNode.state);
            setWinningTiles(selectedNode.state.getWinningTiles());
        }

        if(nextUpdateNode !== null) {
            setSelectedNode(nextUpdateNode);
            setNextUpdateNode(null);
            setStep(0);
        }
    }, [selectedNode])

    const getLetter = (tile) => {
        if (tile === 0) {
            return "";
        }
        return tile;
    }

    const getStrikeThrough = (tile) => {
        if (winningTiles.includes(tile)) {
            return "line-through";
        }
        return "none";
    }

    const getStateTile = (node) => {
        if (node === null) {
            return null;
        }
        let color = "primary.main";
        let hoverColor = "primary.dark";
        if (node == selectedNode) {
            color = "secondary.main";
            hoverColor = "secondary.dark";
        }
        let score = 0;
        if (node.visits > 0) {
            score = node.wins /  node.visits;
            score = Math.round(score * 100) / 100;
        }

        return (
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                bgcolor: color,
                borderRadius: "5px",
                width: "250px",
                minWidth: "250px",
                cursor: "pointer",
                userSelect: "none",
                p: 1,
                m: "2px",
                '&:hover': {
                    bgcolor: hoverColor,
                }
            }} onClick={() => {
                setSelectedNode(node)
            }}>
                {node.move != null ?
                    <Typography variant="body1" sx={{
                    }}>
                        ({node.move % 3 + 1}, {Math.floor(node.move / 3) + 1})
                    </Typography> :
                    <Typography variant="body1" sx={{
                    }}>
                        Root
                    </Typography>
                }
                <Typography variant="body1" sx={{
                }}>
                    WR: {score}
                </Typography>
                <Typography variant="body1" sx={{
                }}>
                    UCB: {Math.round(100*node.getUCB(),2)/100}
                </Typography>
                <Typography variant="body1" sx={{
                }}>
                    V: {node.visits}
                </Typography>
            </Box>
        )
    }
    const performStep = () => {
        setMessage("");
        if (step === 0) {
            let selected = mctsNode.select();
            setSelectedNode(selected);
        } else if (step === 1) {
            let next = selectedNode.expand();
            if (next == selectedNode) {
                setMessage("Selected node hasn't been explored, so not expanding");
            }
            setSelectedNode(next);
        } else if (step === 2) {
            let result = selectedNode.rollout();
            let finalNode = result[1];
            setGame(finalNode);
        } else if (step === 3) {
            let score = game.winner === "X" ? 1 : (game.winner === "O" ? 0 : .5);
            selectedNode.backpropagate(score);

            setSelectedNode(mctsNode);
        }
        setStep((step + 1) % 4);
    }


    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "80vw",
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
            }}>
                {Board()}
                {mctsNode && 
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "space-around",
                    // maxWidth: "500px",
                    width: "100%",
                    flex: 1,
                    p: 2,
                    overflowX: "auto",
                    height: "300px",
                }}>
                    {selectedNode && selectedNode.parent && getStateTile(selectedNode.parent)}
                    {getStateTile(selectedNode)}
                    <Box sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        userSelect: "none",
                    }}>
                        {selectedNode.children.map((child, i) => {
                            return (<div key={child.score + "," + i}>
                                {getStateTile(child)}
                            </div>);
                        })}
                    </Box>
                </Box>}
            </Box>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
            }}>
                {!props.showManyButton && <Button variant="contained" sx={{ mt: 2 }} onClick={() => performStep()}>
                    {steps[step]}
                </Button>}
                {props.showManyButton &&
                <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={() => {
                    let root = mctsNode;
                    for (let i = 0; i < 1; i++) {
                        let selected = root.select();
                        let next = selected.expand();
                        let result = next.rollout();
                        let finalNode = result[1];
                        
                        let score = finalNode.winner === "X" ? 1 : (finalNode.winner === "O" ? 0 : .5);
                        next.backpropagate(score);
                    }
                    setNextUpdateNode(root);
                    performStep();
                }}
                    >
                    Perform 1 Steps
                </Button>}

                {props.showManyButton &&
                <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={() => {
                    let root = mctsNode;
                    for (let i = 0; i < 1000; i++) {
                        let selected = root.select();
                        let next = selected.expand();
                        let result = next.rollout();
                        let finalNode = result[1];
                        
                        let score = finalNode.winner === "X" ? 1 : (finalNode.winner === "O" ? 0 : .5);
                        next.backpropagate(score);
                    }
                    setNextUpdateNode(root);
                    performStep();
                }}
                    >
                    Perform 1000 Steps
                </Button>}

                {props.showManyButton &&
                <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={() => {
                    let root = mctsNode;
                    for (let i = 0; i < 10000; i++) {
                        let selected = root.select();
                        let next = selected.expand();
                        let result = next.rollout();
                        let finalNode = result[1];
                        
                        let score = finalNode.winner === "X" ? 1 : (finalNode.winner === "O" ? 0 : .5);
                        next.backpropagate(score);
                    }
                    setNextUpdateNode(root);
                    performStep();
                }}
                    >
                    Perform 10000 Steps
                </Button>}

                {props.showManyButton &&
                <Button variant="contained" sx={{ mt: 2, ml: 2 }} onClick={() => {
                    let root = mctsNode;
                    for (let i = 0; i < 100000; i++) {
                        let selected = root.select();
                        let next = selected.expand();
                        let result = next.rollout();
                        let finalNode = result[1];
                        
                        let score = finalNode.winner === "X" ? 1 : (finalNode.winner === "O" ? 0 : .5);
                        next.backpropagate(score);
                    }
                    setNextUpdateNode(root);
                    performStep();
                }}
                    >
                    Perform 100000 Steps
                </Button>}
            </Box>
            <Typography variant="body1" sx={{ mt: 2 }}>
                {message}
            </Typography>
        </Box>
    )

    function Board() {
        return <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            {Array(3).fill(0).map((_, i) => {
                return (
                    <Box
                    key={"row" + i}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                    }}>
                        {Array(3).fill(0).map((_, j) => {
                            return (
                                <Box 
                                key={"tile" + i + j}
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: 75,
                                    height: 75,
                                    color: "white",
                                    bgcolor: "primary.main",
                                    borderRadius: 5,
                                    userSelect: "none",
                                    m: "2px",
                                    textDecoration: getStrikeThrough(i * 3 + j),
                                }}>
                                    <Typography variant="h2">
                                        {getLetter(game.board[i * 3 + j])}
                                    </Typography>
                                </Box>
                            );
                        })}
                    </Box>
                );
            })}
        </Box>;
    }
}

let mcts_convergence = {
    "title": "Why use Monte Carlo Tree Search? (Part 1 Introduction to Convergence)",
    "categories": [
        "Machine Learning",
        "Reinforcement Learning",
        "Monte Carlo Tree Search",
        "Games"
    ],
    id: 4,
    "body": {
        "type": "markdown",
        "content": (
            <Box>
                <Typography variant="h4">
                    Introduction
                </Typography>
                <Typography variant="body1">
                    Since its usage by the Deepmind team in their AlphaGo AI, Monte Carlo tree search (MCTS) has seen a surge of interest and usage in the world of reinforcement learning. 
                    It is far from the only algorithm used in reinforcement learning, yet it remains popular due to its simplicity, effectiveness, and its gauranteed convergence. In this series of posts I want to explore 
                    what convergence means in the context of MCTS, why MCTS converges, and when it doesn't converge.
                </Typography>
                <Typography variant="h4">
                    Convergence
                </Typography>
                <Typography variant="body1">
                    Let's first consider a trivial example to gain an understanding of what MCTS is doing. Tic Tac Toe has 765 possible states and if played perfectly, always results in a draw. I couldn't find a reference to when it was first solved, but at least the first computer algorithm that played it perfectly was created in 1952 at the University of Cambridge.
                    We consider the value of a state to be the maximum potential score that can be achieved from it with perfect play (in our case we are defining 1 to be X's win, -1 to be O's win, and 0 to be a draw). Tic Tac Toe, being solved means that for every state the value is known. Below is a demonstration of that, with an interactive tree of each possible state along with the value (the value is computed via Minimax search).
                </Typography>
                <MiniMax_TicTacToe />
                <Typography variant="body1">
                    This tree is the optimal solution to the environment Tic Tac Toe. Every deterministic environment has such a tree. This tree is equivalent to the <b>Optimal Policy</b>. The optimal policy is a function that takes in a given state and output's the "move" that leads to the child state with the highest value. This is equal to picking the child with the highest value.
                </Typography>
                <Typography variant="body1">
                    Getting back to MCTS. The claim that MCTS converges, means that given sufficient time and space, the tree it produces would eventually equal the optimal tree. Let's quickly review how MCTS works to understand this better.
                </Typography>
                <Typography variant="h4">
                    MCTS
                </Typography>
                <Typography variant="body1">
                    MCTS is a 4 step process that is repeated until convergence. The 4 steps are: selection, expansion, simulation (aka rollout), backpropagation.
                    <ol>
                        <li>
                            <b>Selection</b>: Starting from the root node, we select a child node until we reach a node with no children. The selection process is based on the UCB formula, which aims to balance exploration and exploitation. We'll get more into the UCB formula in the next post.
                        </li>
                        <li>
                            <b>Expansion</b>: If the selected node is not a terminal node, we expand it by adding all of its children to the tree and randomly select one of them to expand (some variations only expand one node). If the selected node is a terminal node, or it has never been explored before, we return it without expanding.
                        </li>
                        <li>
                            <b>Simulation (Rollout)</b>: We then simulate a game from the selected node until it reaches a terminal state. The simulation is done by randomly selecting a move from the current state until the game is over. When I first learned about MCTS, I found it shocking that just randomly simulating the game could converge to the optimal tree. The part I was missing is that MCTS relies on a lot of simulations before it starts to converge. Because of this doing random rollout is actually better than something more intelligent because it means that rollout is incredibly fast so we can explore thousands of nodes in under a second.
                        </li>
                        <li>
                            <b>Backpropagation</b>: We then update the value of the selected node and all of its parents by averaging the value of the selected node with the value of the parent node. This is done recursively until we reach the root node. Unlike in the first tic tac toe example, the score backpropagated is different. In this case X victory is 1, draw is .5, and O victory is 0. This is because MCTS is trying to calculate the win rate (wins / visits), and not the optimal value.
                        </li>
                    </ol>
                    Below is an interactive demonstration of MCTS on the Tic Tac Toe environment. It start with only the root node (no moves have been made state) and then expands the tree by selecting a child node and then simulating a game from that node. Clicking the button performs the action from the currently selected node, so if you manually explore the tree it may lead to unexpected behavior.
                    WR = Win Rate, V = Visits, U = UCB Value
                </Typography>
                <MCTS_TicTacToe/>
                <Typography variant="body1">
                    Now let's look at what happens when we repeat this process many times (100000 steps takes about a 40 seconds on my computer)
                </Typography>
                <MCTS_TicTacToe showManyButton={true}/>

                <Typography variant="body1">
                    It takes about 100000 steps for MCTS to converge to the optimal tree. Now you may be thinking. If there are only 765 possible states, brute force search can solve it much faster than 100000 steps. Why use MCTS? That point is completely valid, and furthermore MCTS is much more memory intensive as well.
                    The answer comes down to the branching factor of the environment. The interesting behavior of MCTS is that it always only takes about 100000 steps to converge, even when the branching factor is large. This is down to what the UCB formula is doing. The UCB formula is balancing exploration and exploitation. 
                    If you increment the above example by 100000 each time, you will see that initially it thinks that the opening move (2,2) is a guaranteed win, but as it explores more it realizes that it is a forced draw, the UCB shifts down to reflect that and (2,2) is picked less and less. The entire idea of MCTS is to focus on exploring the most promising moves.

                    If you want to look at some examples where the branching factor is much higher look at <a href="https://np-problems.web.app/aiblocks" style={{display: "inline-block"}}>Blocks</a> or <a href="https://np-problems.web.app/Othello" style={{display: "inline-block"}}>Othello</a>. Both of these games are not solved, but MCTS still performs well. Blocks is very interesting because it isn't a deterministic game. The proof for the convergence of MCTS fails in this case, yet it still performs very well.
                </Typography> 

                <Typography variant="body1">
                    In the next post we will look at the derivation of the UCB formula, and the proof of convergence of MCTS in perfect information, deterministic environments.
                </Typography>
            </Box>
        )
    }
}

export default mcts_convergence;