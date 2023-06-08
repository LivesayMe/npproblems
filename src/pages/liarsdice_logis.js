class Liars {
    constructor(playerCount, diceCount) {
        this.playerCount = playerCount;
        this.diceCount = diceCount;

        this.players = Array(playerCount).fill(diceCount);
        this.currentPlayer = 0;
        this.rolls = [];
        this.round = 0;
        this.rounds = [];

        this.lastMoves = Array(playerCount).fill([-1, -1]); // [number, count]

        this.currentBid = [0, -1]; // [number, count]
        
        this.gameOver = false;
        this.roll();
    }

    reset() {
        this.players = Array(this.playerCount).fill(this.diceCount);
        this.currentPlayer = 0;
        this.rolls = [];
        this.round = 0;
        this.rounds = [];

        this.currentBid = [0, -1]; // [number, count]
        
        this.gameOver = false;
    }

    roll() {
        for(let i = 0; i < this.playerCount; i++) {
            this.rolls[i] = Array(this.players[i]).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
        }
    }

    makeMove(move) {
        let number = move[0];
        let count = move[1];

        this.lastMoves[this.currentPlayer] = move;

        if(count == -1) { //CALL
            let actualCount = (this.rolls.map(q => q.filter((x) => x == this.currentBid[1]).length)).reduce((partial, a) => partial+a, 0);
            console.log("Actual count: " + actualCount + " Bid count: " + this.currentBid[0])
            if(actualCount < this.currentBid[0]) {
                //Previous player loses one dice
                let previousPlayerIndex = (this.currentPlayer + this.playerCount - 1) % this.playerCount;
                while(this.players[previousPlayerIndex] == 0) {
                    previousPlayerIndex = (previousPlayerIndex + this.playerCount - 1) % this.playerCount;
                }

                this.players[previousPlayerIndex] -= 1;

                if(this.players[previousPlayerIndex] > 0) {
                    this.currentPlayer = previousPlayerIndex;
                } else {
                    //Current player remains current player
                }

                //If no other player has dice, game is over
                if(this.players.filter((x) => x > 0).length == 1) {
                    this.gameOver = true;
                }
                this.lastMoves[this.currentPlayer] = [-1, -1];
            } else {
                //Current player loses one dice
                this.players[this.currentPlayer] -= 1;
                
                //If no other player has dice, game is over
                if(this.players.filter((x) => x > 0).length == 1) {
                    this.gameOver = true;
                }
                this.lastMoves[this.currentPlayer] = [-1, -1];
            }
            this.currentBid = [0, -1];
            this.roll();
        } else { //RAISE
            this.currentBid = [number, count];
            this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
            while(this.players[this.currentPlayer] == 0) {
                this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
            }

            this.lastMoves[this.currentPlayer] = [-1, -1];
        }
    }

    call() {
        this.makeMove([0, -1]);
    }

    getAvailableMoves() {
        let moves = [];
        if(this.currentBid[1] != -1) { //First move
            moves.push([0,-1]); //CALL
        }

        //RAISE
        for(let i = this.currentBid[0] + 1;i <=6; i++) {
            moves.push([i, this.currentBid[1]]);
        }

        for (let i = this.currentBid[0] + 1; i <= this.currentBid[0] + 4; i++) {
            for(let j = 1; j <= 6; j++) {
                moves.push([i, j]);
            }
        }

        return moves;
    }

    copy() {
        let newgame = new Liars(this.playerCount, this.diceCount);
        newgame.players = this.players.slice();
        newgame.currentPlayer = this.currentPlayer;
        newgame.rolls = this.rolls.slice();
        newgame.round = this.round;
        newgame.rounds = this.rounds.slice();
        newgame.currentBid = this.currentBid.slice();
        newgame.gameOver = this.gameOver;
        newgame.lastMoves = this.lastMoves.slice();
        return newgame;
    }

    expectedProbability(player, number, count) {
        let playerNumber = this.rolls[player].filter((x) => x == number).length;

        let remainingDice = this.players.reduce((partial, a) => partial+a, 0) - this.players[player];

        let remainingNeeded = count - playerNumber;

        //Using binomial distribution, calculate probability of rolling at least remainingNeeded in remainingDice
        let probability = 0;
        for(let i = remainingNeeded; i <= remainingDice; i++) {
            probability += this.binomialDistribution(remainingDice, i, 1/6);
        }
        return probability;
    }

    binomialDistribution(n, k, p) {
        return this.combination(n, k) * Math.pow(p, k) * Math.pow(1-p, n-k);
    }

    combination(n, k) {
        return this.factorial(n) / (this.factorial(k) * this.factorial(n-k));
    }

    factorial(n) {
        let product = 1;
        for(let i = 1; i <= n; i++) {
            product *= i;
        }
        return product;
    }
}

export default Liars;