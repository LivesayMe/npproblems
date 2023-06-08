class UnoGame {
    constructor(playerCount) {
        this.deck = [];
        this.discard = [];
        this.playerHands = [];
        this.currentPlayer = 0;
        this.direction = 1;
        this.gameOver = false;
        this.playerCount = playerCount;
        for (let i = 0; i < playerCount; i++) {
            this.playerHands.push([]);
        }

        this.cards = [];
        this.colors = ["red", "blue", "green", "yellow"];
        this.specials = ["skip", "reverse", "draw2"];
        this.wilds = ["wild", "wild4"];
        this.numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        let cardCount = 0;

        console.log("Initialized parameters")

        // Create the deck
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < this.numbers.length; j++) {
                this.cards.push({color: this.colors[i], number: this.numbers[j], id: cardCount++});
            }
            for (let j = 0; j < this.specials.length; j++) {
                this.cards.push({color: this.colors[i], special: this.specials[j], id: cardCount++});
            }
        }
        for (let i = 0; i < this.wilds.length; i++) {
            this.cards.push({wild: this.wilds[i], id: cardCount++});
        }

        // Shuffle the deck
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }

        console.log("Created deck")

        // Deal the cards
        for (let i = 0; i < 7; i++) {
            for (let j = 0; j < playerCount; j++) {
                this.dealCard(j);
            }
        }

        //Add one card to the discard pile (that isn't a wild)
        let c = this.cards.pop();
        while (c.wild) {
            this.cards.push(c);
            //Pop from start
            c = this.cards.shift();
        }
        this.discard.push(c);
    }

    dealCard(player) {
        if (this.cards.length === 0) {
            this.cards = this.discard
            //Keep the top card
            this.discard = [this.cards.pop()];
            //Shuffle the rest
            for (let i = this.cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
            }
        }
        this.playerHands[player].push(this.cards.pop());
    }

    nextPlayer() {
        if ((this.currentPlayer + this.direction) % this.playerCount < 0)
        {
            return this.playerCount - 1;
        }
        return (this.currentPlayer + this.direction) % this.playerCount;
    }

    //Plays the card and handles side effects, returns true if the game is over, null if the function was called incorrectly, and false otherwise
    playCard(player, card, color=null) {
        //Get the card
        const c = this.playerHands[player].splice(card, 1)[0];
        this.discard.push(c);

        //Check if the player's hand is empty
        if (this.playerHands[player].length === 0) {
            this.gameOver = true;
            return true;
        }

        //Check if the card is a wild
        if (c.wild) {
            if (color) {
                c.color = color;
            } else {
                return null;
            }
        }

        //Check if the card is a special
        if (c.special) {
            if (c.special === "skip") {
                this.currentPlayer = this.nextPlayer();
            } else if (c.special === "reverse") {
                this.direction *= -1;
            } else if (c.special === "draw2") {
                this.dealCard(this.nextPlayer());
                this.dealCard(this.nextPlayer());

                //Move to the next player
                this.currentPlayer = this.nextPlayer();
            }
        }

        //Check if the card is a draw4
        if (c.wild === "wild4") {
            this.dealCard(this.nextPlayer());
            this.dealCard(this.nextPlayer());
            this.dealCard(this.nextPlayer());
            this.dealCard(this.nextPlayer());

            //Move to the next player
            this.currentPlayer = this.nextPlayer();
        }

        //Move to the next player
        this.currentPlayer = this.nextPlayer();
        //If current player is negative (happens when direction is -1), set current player to the last player
        if (this.currentPlayer < 0) {
            this.currentPlayer = this.playerCount - 1;
        }

        return false;
    }

    getHand(player) {
        return this.playerHands[player];
    }

    getDiscard() {
        //Return the last card in the discard pile
        return this.discard[this.discard.length - 1];
    }

    getCurrentPlayer() {
        return this.currentPlayer;
    }

    canPlayCard(player, card) {
        if (card === -1)
        {
            return false;
        }
        if (player !== this.currentPlayer) {
            return false;
        }
        const c = this.playerHands[player][card];
        const d = this.getDiscard();
        if (c.color === d.color) {
            return true;
        }
        if (c.number === d.number && c.number !== undefined) {
            return true;
        }
        if (c.special === d.special && c.special !== undefined) {
            return true;
        }
        if (c.wild !== undefined) {
            return true;
        }
        return false;
    }

    //Create functions that mcts expects
    getAvailableMoves() {
        const moves = [];
        console.log(this.currentPlayer)

        for (let i = 0; i < this.playerHands[this.currentPlayer].length; i++) {
            if (this.canPlayCard(this.currentPlayer, i)) {
                if (this.playerHands[this.currentPlayer][i].wild) {
                    for (let j = 0; j < this.colors.length; j++) {
                        moves.push([i, this.colors[j]]);
                    }
                }
                else {
                    moves.push(i);
                }
            }
        }
        
        if (moves.length === 0) {
            moves.push(-1);
        }
        return moves;
    }

    makeMove(move) {
        if (move.length === 2) {
            return this.playCard(this.currentPlayer, move[0], move[1]);
        } else {
            if (move === -1) {
                this.dealCard(this.currentPlayer);
                this.currentPlayer = this.nextPlayer();
                return false;
            }
            return this.playCard(this.currentPlayer, move);
        }
    }

    getWinner() {
        for (let i = 0; i < this.playerCount; i++) {
            if (this.playerHands[i].length === 0) {
                return i;
            }
        }
        return null;
    }
}

const copyGame = (game) => {
    console.log("Copying game")
    console.log(game.playerCount)
    const newGame = new UnoGame(game.playerCount);
    console.log("Copying deck")
    newGame.deck = game.deck.slice();
    console.log("Copying discard")
    newGame.discard = game.discard.slice();
    console.log("Copying hands")
    newGame.playerHands = game.playerHands.slice();
    console.log("Copying current player")
    newGame.currentPlayer = game.currentPlayer;
    console.log("Copying direction")
    newGame.direction = game.direction;
    console.log("Copying game over")
    newGame.gameOver = game.gameOver;
    console.log("Copying player count")
    newGame.playerCount = game.playerCount;
    return newGame;
}

export {UnoGame, copyGame};