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
    uct() {
        if (this.visits === 0) {
            return Infinity;
        }
        if (!this.is_score) {
            let black_wins = (this.visits - this.wins) / 2;
            let white_wins = this.visits - black_wins;
            return white_wins / this.visits + 2 * Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);
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
    
    best_child() {
        return this.children.reduce((bestChild, child) => {
            return child.uct() > bestChild.uct() ? child : bestChild;
        }, this.children[0]);
    }
    
    best_move() {
        return this.children.reduce((bestChild, child) => {
            return child.visits > 0 && (child.wins / child.visits) > (bestChild.wins / bestChild.visits) ? child : bestChild;
        }, this.children[0]).move;
    }

}

//Returns promise that resolves to best move
async function mcts_move(game, is_score = true, root = null, max_time = 0.75) {
    return new Promise((resolve, reject) => {
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
    
        node = node.best_child();
        const score = node.rollout();
        node.backpropagate(score);
        count += 1;
        }
    
        console.log(`Explored ${count} nodes`);

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

        // Print win rates
        console.log("Win rates:");
        for (let win_rate of win_rates) {
            console.log(win_rate[0] + ", " + win_rate[1]);
        }

        resolve(root.best_move());
        

        
    });
}

export default mcts_move;