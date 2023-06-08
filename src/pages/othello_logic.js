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
        newGame.moveCount = this.moveCount;
        return newGame;
    }
}

export default OthelloGame;