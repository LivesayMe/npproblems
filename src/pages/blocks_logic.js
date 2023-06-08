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

    isBlockHasMoves(block) {
        for (let i = 0; i < 8; i++) {
            for (let j = 0; j < 8; j++) {
                if (this.isValidMove(block, [i, j])) {
                    return true
                }
            }
        }
        return false;
    }
}

export default Blocks;