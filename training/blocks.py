import numpy as np
from random import choice

#List of tetris-like blocks
validBlocks = [
    [[1, 1, 1, 1]], #I
    [[1, 1, 1], [0, 0, 1]], #L
    [[1, 1, 1], [1, 0, 0]], #J
    [[1, 1], [1, 1]], #O
    [[1, 1, 0], [0, 1, 1]], #S
    [[0, 1, 1], [1, 1, 0]], #Z
    [[0, 1, 0], [1, 1, 1]] #T
]

class Blocks:
    def __init__(self):
        self.grid = np.zeros((8, 8), dtype=np.int8)
        self.availableBlocks = [choice(validBlocks) for i in range(3)]
        self.score = 0
        self.gameOver = False
    
    def copy(self):
        new = Blocks()
        new.grid = self.grid.copy()
        new.availableBlocks = [block.copy() for block in self.availableBlocks]
        new.score = self.score
        new.gameOver = self.gameOver
        return new
    
    def makeMove(self, block, location): #location is a tuple (x, y)
        #Check if the move is valid
        if not self.isValidMove(block, location):
            return False
        
        #Place the block
        for i in range(len(block)):
            for j in range(len(block[0])):
                if block[i][j] == 1:
                    self.grid[location[0] + i][location[1] + j] = 1
        
        #Remove the block from the available blocks
        self.availableBlocks.remove(block)
    
        #Check for completed rows and columns, and remove them
        self.removeCompletedLines()
        
        #Check if there are no more available blocks
        if len(self.availableBlocks) == 0:
            self.availableBlocks = [choice(validBlocks) for i in range(3)]

        #Check if the game is over
        if self.isGameOver():
            self.gameOver = True
            return False

        return True
    
    def isValidMove(self, block, location):
        #Check if the block is in the grid
        if location[0] + len(block) > 8 or location[1] + len(block[0]) > 8:
            return False
        
        #Check if the block overlaps with another block
        for i in range(len(block)):
            for j in range(len(block[0])):
                if block[i][j] == 1 and self.grid[location[0] + i][location[1] + j] == 1:
                    return False
        
        return True
    
    def removeCompletedLines(self):
        count = 0
        completedRows = []
        completedColumns = []

        #Check for completed rows
        for i in range(8):
            if 0 not in self.grid[i]:
                completedRows.append(i)
                count += 1
        
        #Check for completed columns
        for i in range(8):
            if 0 not in self.grid[:, i]:
                completedColumns.append(i)
                count += 1
        
        #Remove completed rows and columns
        for row in completedRows:
            for j in range(8):
                self.grid[row][j] = 0
        for column in completedColumns:
            for i in range(8):
                self.grid[i][column] = 0

        #Update the score
        self.score += count ** 2
    
    def isGameOver(self):
        #If all available blocks have no valid spots, the game is over
        for block in self.availableBlocks:
            for i in range(8):
                for j in range(8):
                    if self.isValidMove(block, (i, j)):
                        return False
        return True
    
    def getAvailableMoves(self):
        moves = []
        for block in self.availableBlocks:
            for i in range(8):
                for j in range(8):
                    if self.isValidMove(block, (i, j)):
                        moves.append((block, (i, j)))
        return moves
    
    def printGrid(self):
        tile_map = {
            0: " ",
            1: "█"
        }
        for i in range(8):
            for j in range(8):
                print(tile_map[self.grid[i][j]], end="")
            print()
    
    def printBlocks(self):
        tile_map = {
            0: " ",
            1: "█"
        }
        for block in self.availableBlocks:
            for i in range(len(block)):
                for j in range(len(block[0])):
                    print(tile_map[block[i][j]], end="")
                print()
            print()
    
    def fen(self):
        fen = ""
        for i in range(8):
            for j in range(8):
                if self.grid[i][j] == 0:
                    fen += "0"
                else:
                    fen += "1"
        fen += "#"
        for block in self.availableBlocks:
            for i in range(len(block)):
                for j in range(len(block[0])):
                    if block[i][j] == 0:
                        fen += "0"
                    else:
                        fen += "1"
                fen += "|"
            fen += "#"
        return fen
    
    def fromFen(self, fen):
        fen = fen.split("#")
        grid = fen[0]
        blocks = fen[1:-1]
        self.grid = np.zeros((8, 8), dtype=np.int8)
        self.availableBlocks = []
        for i in range(8):
            for j in range(8):
                if grid[i * 8 + j] == "1":
                    self.grid[i][j] = 1
        for block in blocks:
            block = block.split("|")
            block = [list(map(int, list(row))) for row in block]
            if len(block[-1]) == 0:
                block = block[:-1]
            self.availableBlocks.append(block)