class OthelloGame {
    constructor() {
        this.board = [];
        this.gameOver = false;
        this.curColor = 1;
        this.moveCount = 0;
        this.reset();
    }

    reset() {
        let newBoard = [];
        for (let i = 0; i < 8; i++) {
            newBoard.push([]);
            for (let j = 0; j < 8; j++) {
                newBoard[i].push(0);
            }
        }
        newBoard[3][4] = 1;
        newBoard[3][3] = -1;
        newBoard[4][4] = -1;
        newBoard[4][3] = 1;
        this.board = newBoard;
        this.gameOver = false;
        this.curColor = 1;
    }

    getAvailableMoves(player) {
        let color = player;
        if (color == null) {
            color = this.curColor;
        }
        let moves = [];
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.isTileValid(color, i, j)) {
                    moves.push([i, j]);
                }
            }
        }
        return moves;
    }

    isTileValid(player, x, y) {
        if (this.gameOver) {
            return false;
        }
        // Check if the tile is empty
        if (this.board[x][y] !== 0) {
            return false;
        }
        let tileColor = player;
        let oppositeColor = -1 * player;
        //Check if the tile is next to a tile of the opposite color
        let isNextToOpposite = false;
        let validDirections = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (!(i === 0 && j === 0)) {
                    if (x + i >= 0 && x + i < 8 && y + j >= 0 && y + j < 8) {
                        if (this.board[x + i][y + j] === oppositeColor) {
                            isNextToOpposite = true;
                            validDirections.push([i, j]);
                        }
                    }
                }
            }
        }
        if (!isNextToOpposite) {
            return false;
        }

        //Check that in at least one direction there is a tile of the same color after the different colored tile
        let isNextToSame = false;
        for (let i = 0; i < validDirections.length; i++) {
            let dir = validDirections[i];
            let currX = x + dir[0];
            let currY = y + dir[1];
            while (currX >= 0 && currX < 8 && currY >= 0 && currY < 8) {
                if (this.board[currX][currY] === tileColor) {
                    isNextToSame = true;
                    break;
                }
                if (this.board[currX][currY] === 0) {
                    break;
                }
                currX += dir[0];
                currY += dir[1];
            }
        }

        return isNextToSame;
    }

    getTilesToFlip(player, x, y) {
        //Get the color of the tile
        let tileColor = player;
        let oppositeColor = -1 * player;

        //Git which directions to check
        let validDirections = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (!(i === 0 && j === 0)) {
                    if (x + i >= 0 && x + i < 8 && y + j >= 0 && y + j < 8) {
                        if (this.board[x + i][y + j] === oppositeColor) {
                            validDirections.push([i, j]);
                        }
                    }
                }
            }
        }

        let tilesToFlip = [];
        for (let i = 0; i < validDirections.length; i++) {
            let curFlip = [];
            let dir = validDirections[i];
            let currX = x + dir[0];
            let currY = y + dir[1];
            while (currX >= 0 && currX < 8 && currY >= 0 && currY < 8) {
                curFlip.push([currX, currY]);
                if (this.board[currX][currY] === tileColor) {
                    //Add all the tiles in curFlip to tilesToFlip
                    tilesToFlip = tilesToFlip.concat(curFlip);
                    break;
                }
                if(this.board[currX][currY] === 0) {
                    break;
                }
                
                currX += dir[0];
                currY += dir[1];
            }
        }

        return tilesToFlip;
    }

    placeTile(x, y) {
        this.moveCount++;
        let tilesToFlip = this.getTilesToFlip(this.curColor, x, y);
        for (let i = 0; i < tilesToFlip.length; i++) {
            this.board[tilesToFlip[i][0]][tilesToFlip[i][1]] = this.curColor;
        }
        this.board[x][y] = this.curColor;

        if (this.getAvailableMoves(this.curColor * -1).length === 0) {
            if (this.getAvailableMoves(this.curColor).length === 0) {
                this.gameOver = true;

                let whiteScore = this.getScore(1);
                let blackScore = this.getScore(-1);

                if (whiteScore > blackScore) {
                    this.score = 1;
                } else if (blackScore > whiteScore) {
                    this.score = -1;
                } else {
                    this.score = 0;
                }
            }
        } else {
            this.curColor = -1 * this.curColor;
        }
    }

    makeMove(x, y) {
        this.placeTile(x, y);
    }

    getScore(player) {
        let score = 0;
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.board[i][j] === player) {
                    score++;
                }
            }
        }
        return score;
    }

    copy() {
        let newGame = new OthelloGame();
        newGame.board = this.board.map(function(arr) {
            return arr.slice();
        });
        newGame.gameOver = this.gameOver;
        newGame.curColor = this.curColor;
        return newGame;
    }
}

class MCTS_Node {
    constructor(state, parent, move, is_score = true) {
    this.state = state;
    this.children = [];
    this.visits = 0;
    this.wins = 0;
    this.parent = parent;
    this.move = move;
    this.is_score = is_score;
    }
    uct(isMaximizing) {
        if (this.visits === 0) {
            return Infinity;
        }
        if (!this.is_score) {
            let black_wins = (this.visits - this.wins) / 2;
            let white_wins = this.visits - black_wins;
            if (isMaximizing) {
                return white_wins / this.visits + 2 * Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);
            } else {
                return black_wins / this.visits + 2 * Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);
            }
        }
        return this.wins / this.visits + 2 * Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);
    }
    
    rollout() {
        let new_game = this.state.copy();
        while (!new_game.gameOver) {
            let moves = new_game.getAvailableMoves();
            let move = moves[Math.floor(Math.random() * moves.length)];
            new_game.makeMove(move[0], move[1]);
        }
        return new_game.score;
    }
    
    backpropagate(score) {
        this.visits += 1;
        this.wins += score;
        if (this.parent) {
            this.parent.backpropagate(score);
        }
    }
    
    expand() {
        for (let move of this.state.getAvailableMoves()) {
            let new_game = this.state.copy();
            new_game.makeMove(move[0], move[1]);
            this.children.push(new MCTS_Node(new_game, this, move, this.is_score));
        }
    }
    
    best_child(isMaximizing) {
        return this.children.reduce((bestChild, child) => {
            return child.uct(isMaximizing) > bestChild.uct(isMaximizing) ? child : bestChild;
        }, this.children[0]);
    }
    
    best_move() {
        return this.children.reduce((bestChild, child) => {
            return child.visits > 0 && (child.wins / child.visits) > (bestChild.wins / bestChild.visits) ? child : bestChild;
        }, this.children[0]).move;
    }

    selection(is_maximizer = true) {
        let node = this;
        let isMaximizing = is_maximizer;
        while (node.children.length > 0) {
            node = node.best_child(isMaximizing);
            isMaximizing = !isMaximizing;
        }
        //Expand if not terminal node
        if (node.state.getAvailableMoves().length > 0) {
            node.expand();
        }
        if(node.state.gameOver) {
            return node
        }
        //Return a random child
        return node.children[Math.floor(Math.random() * node.children.length)];
    }

}

//Returns promise that resolves to best move
function mcts_move(game, is_score = true, root = null, max_time = 0.75, is_maximizer = true) {
    if (root === null) {
    root = new MCTS_Node(game, null, null, is_score);
    }

    const start_time = Date.now();
    let count = 0;

    while (Date.now() - start_time < max_time * 1000) {
        let node = root;

        if (node.children.length === 0) {
            node.expand();
        }

        node = node.selection(is_maximizer);
        if(node.state.gameOver) {
            node.backpropagate(node.state.score);
            continue;
        }
        const score = node.rollout();
        node.backpropagate(score);
        count += 1;
    }

    // Print win rates 
    let win_rates = [];
    for (let child of root.children) {
        let black_wins = (child.visits - child.wins) / 2;
        let white_wins = child.visits - black_wins;
        win_rates.push([child.move, white_wins / child.visits]);
    }

    // Sort win rates
    win_rates.sort((a, b) => {
        return b[1] - a[1];
    });

    if (is_maximizer) {
        remembered_tree = root.best_child(true);
        return win_rates[0];
    } else {
        // Return move that minimizes opponent's win rate
        let result = win_rates[win_rates.length - 1];
        result[1] = 1 - result[1];
        remembered_tree = root.best_child(false);
        return result;
    }
}

function alpha_beta(game, depth, alpha, beta, maximizingPlayer) {
    if (depth === 0 || game.gameOver) {
        if(game.gameOver) {
            return game.score;
        } else {
            let wr = mcts_move(game, true, null, 0.05, maximizingPlayer)[1];
            // console.log(wr);
            return wr;
        }
    }

    if (maximizingPlayer) {
        let bestScore = -Infinity;
        for (let move of game.getAvailableMoves()) {
            let new_game = game.copy();
            new_game.makeMove(move[0], move[1]);
            let score = alpha_beta(new_game, depth - 1, alpha, beta, false);
            bestScore = Math.max(score, bestScore);
            alpha = Math.max(alpha, score);
            if (beta <= alpha) {
                break;
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let move of game.getAvailableMoves()) {
            let new_game = game.copy();
            new_game.makeMove(move[0], move[1]);
            let score = alpha_beta(new_game, depth - 1, alpha, beta, true);
            bestScore = Math.min(score, bestScore);
            beta = Math.min(beta, score);
            if (beta <= alpha) {
                break;
            }
        }
        return bestScore;
    }
}

function alpha_beta_move(game, depth, alpha, beta, maximizingPlayer) {
    let bestMove = null;
    if (maximizingPlayer) {
        let bestScore = -Infinity;
        for (let move of game.getAvailableMoves()) {
            let new_game = game.copy();
            new_game.makeMove(move[0], move[1]);
            let score = alpha_beta(new_game, depth - 1, alpha, beta, false);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
            alpha = Math.max(alpha, score);
            if (beta <= alpha) {
                break;
            }
        }
        return [bestMove, bestScore];
    } else {
        let bestScore = Infinity;
        for (let move of game.getAvailableMoves()) {
            let new_game = game.copy();
            new_game.makeMove(move[0], move[1]);
            let score = alpha_beta(new_game, depth - 1, alpha, beta, true);
            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
            beta = Math.min(beta, score);
            if (beta <= alpha) {
                break;
            }
        }
        return [bestMove, bestScore];
    }
}


//Web worker that runs MCTS in the background
let remembered_tree = null;
onmessage = function(e) {
    let game = new OthelloGame();
    game.board = e.data.game.board;
    game.curColor = e.data.game.curColor;
    game.gameOver = e.data.game.gameOver;
    game.moveCount = e.data.game.moveCount;

    let move = [];
    let win_rate = 0;
    if (e.data.ai === "mcts") {
        let root = null;
        if (remembered_tree !== null) {
            root = remembered_tree;
            remembered_tree = null;

            // console.log("Using remembered tree");
            // console.log(root);
        }
        let result = mcts_move(game, false, null, e.data.time, game.curColor === 1)
        move = result[0];
        win_rate = result[1];
    } else if (e.data.ai === "alpha_beta") {
        let depth = 3;
        if (e.data.time < 1) {
            depth = 2;
        } else if(e.data.time < 2) {
            depth = 3;
        } else if (e.data.time < 5) {
            depth = 3;
        } else if (e.data.time < 20) {
            depth = 5;
        }
        let result = alpha_beta_move(game, depth, -Infinity, Infinity, game.curColor === 1);
        move = result[0];
        win_rate = result[1];
    } else if(e.data.ai === "random") {
        let moves = game.getAvailableMoves();
        move = moves[Math.floor(Math.random() * moves.length)];
        win_rate = 0;
    } else if(e.data.ai === "greedy") {
        let moves = game.getAvailableMoves();
        let bestMove = moves[0];
        let bestScore = -Infinity;
        for (let move of moves) {
            let new_game = game.copy();
            new_game.makeMove(move[0], move[1]);
            let score = new_game.getScore(game.curColor);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        move = bestMove;
        win_rate = 0;
    }

    postMessage({
        move: move,
        win_rate: win_rate,
        game: game,
        winPercentages: e.data.winPercentages
    });
}