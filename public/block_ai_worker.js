const validBlocks = [
    [[1, 1, 1, 1]], //I
    [[1, 1, 1], [0, 0, 1]], //L
    [[1, 1, 1], [1, 0, 0]], //J
    [[1, 1], [1, 1]], //O
    [[1, 1, 0], [0, 1, 1]], //S
    [[0, 1, 1], [1, 1, 0]], //Z
    [[0, 1, 0], [1, 1, 1]] //T
]

class Blocks {
    constructor() {
      this.grid = Array.from({length: 8}, () => new Array(8).fill(0));
      this.availableBlocks = Array.from({length: 3}, () => validBlocks[Math.floor(Math.random() * validBlocks.length)]);
      this.score = 0;
      this.gameOver = false;
    }
  
    copy() {
      const newBlocks = new Blocks();
      newBlocks.grid = this.grid.map(row => [...row]);
      newBlocks.availableBlocks = this.availableBlocks.map(block => block.map(row => [...row]));
      newBlocks.score = this.score;
      newBlocks.gameOver = this.gameOver;
      return newBlocks;
    }
  
    makeMove(block, location) {
      // Check if the move is valid
      if (!this.isValidMove(block, location)) {
        return false;
      }
  
      // Place the block
      for (let i = 0; i < block.length; i++) {
        for (let j = 0; j < block[0].length; j++) {
          if (block[i][j] === 1) {
            this.grid[location[0] + i][location[1] + j] = 1;
          }
        }
      }
  
      // Remove the block from the available blocks
      this.availableBlocks.splice(this.availableBlocks.indexOf(block), 1);
  
      // Check for completed rows and columns, and remove them
      this.removeCompletedLines();
  
      // Check if there are no more available blocks
      if (this.availableBlocks.length === 0) {
        this.availableBlocks = Array.from({length: 3}, () => validBlocks[Math.floor(Math.random() * validBlocks.length)]);
      }
  
      // Check if the game is over
      if (this.isGameOver()) {
        this.gameOver = true;
        return false;
      }
  
      return true;
    }
  
    isValidMove(block, location) {
      // Check if the block is in the grid
      if (location[0] + block.length > 8 || location[1] + block[0].length > 8) {
        return false;
      }
  
      // Check if the block overlaps with another block
      for (let i = 0; i < block.length; i++) {
        for (let j = 0; j < block[0].length; j++) {
          if (block[i][j] === 1 && this.grid[location[0] + i][location[1] + j] === 1) {
            return false;
          }
        }
      }
  
      return true;
    }
  
    removeCompletedLines() {
      let count = 0;
      const completedRows = [];
      const completedColumns = [];
  
      // Check for completed rows
      for (let i = 0; i < 8; i++) {
        if (!this.grid[i].includes(0)) {
          completedRows.push(i);
          count += 1;
        }
      }
  
      // Check for completed columns
      for (let i = 0; i < 8; i++) {
        const column = this.grid.map(row => row[i]);
        if (!column.includes(0)) {
          completedColumns.push(i);
          count += 1;
        }
      }
  
      // Remove completed rows and columns
      for (const row of completedRows) {
        this.grid[row].fill(0);
      }
      for (const column of completedColumns) {
        for (let i = 0; i < 8; i++) {
          this.grid[i][column] = 0;
        }
      }
  
      // Update the score
      this.score += count * count;
    }

    isGameOver() {
        for (let block of this.availableBlocks) {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.isValidMove(block, [i, j])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    getAvailableMoves() {
        let moves = [];
        for (let block of this.availableBlocks) {
            for (let i = 0; i < 8; i++) {
                for (let j = 0; j < 8; j++) {
                    if (this.isValidMove(block, [i, j])) {
                        moves.push([block, [i, j]]);
                    }
                }
            }
        }
        return moves;
    }
}

class MCTS_Node {
    constructor(state, parent, move) {
    this.state = state;
    this.children = [];
    this.visits = 0;
    this.wins = 0;
    this.parent = parent;
    this.move = move;
    }
    uct() {
        if (this.visits === 0) {
            return Infinity;
        }
        return this.wins / this.visits + 2 * Math.sqrt(2 * Math.log(this.parent.visits) / this.visits);
    }
    
    rollout() {
        let new_game = this.state.copy();
        while (!new_game.gameOver) {
            let move = new_game.getAvailableMoves()[Math.floor(Math.random() * new_game.getAvailableMoves().length)];
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
            this.children.push(new MCTS_Node(new_game, this, move));
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
function mcts_move(game, root = null, max_time = 0.75) {

    if (root === null) {
    root = new MCTS_Node(game, null, null);
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
    
    return root.best_move();
}

//Web worker that runs MCTS in the background
onmessage = function(e) {
    let game = new Blocks()
    game.grid = e.data.game.grid;
    game.availableBlocks = e.data.game.availableBlocks;
    game.score = e.data.game.score;
    game.gameOver = e.data.game.gameOver;
    let move = mcts_move(game, null, 0.75)
    postMessage({
        block: move[0],
        move: move[1]
    });
}

