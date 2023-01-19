from blocks import Blocks
from random import choice
import time


#Breadth-first search
def bfs(game, depth):
    if depth == 0:
        return game.score
    scores = []
    moves = game.getAvailableMoves()
    if len(moves) == 0:
        return game.score
    for move in moves:
        new_game = game.copy()
        new_game.makeMove(*move)
        scores.append(bfs(new_game, depth - 1))
    return max(scores)

def bfs_move(game):
    scores = []
    for move in game.getAvailableMoves():
        new_game = game.copy()
        new_game.makeMove(*move)
        scores.append(bfs(new_game, 2 - 1))
    return game.getAvailableMoves()[scores.index(max(scores))]

#MCTS - Monte Carlo Tree Search
class MCTS_Node:
    def __init__(self, state, parent, move):
        self.state = state
        self.children = []
        self.visits = 0
        self.wins = 0
        self.parent = parent
        self.move = move
    
    def uct(self):
        if self.visits == 0:
            return float("inf")
        return self.wins / self.visits + 2 * (2 * self.visits) ** 0.5 / (self.visits + 1)
    
    def rollout(self):
        new_game = self.state.copy()
        while not new_game.gameOver:
            move = choice(new_game.getAvailableMoves())
            new_game.makeMove(*move)
        return new_game.score
    
    def backpropagate(self, score):
        self.visits += 1
        self.wins += score
        if self.parent:
            self.parent.backpropagate(score)
    
    def expand(self):
        for move in self.state.getAvailableMoves():
            new_game = self.state.copy()
            new_game.makeMove(*move)
            self.children.append(MCTS_Node(new_game, self, move))
    
    def best_child(self):
        return max(self.children, key = lambda child: child.uct())
    
    def best_move(self):
        return max(self.children, key = lambda child: child.wins/child.visits if child.visits > 0 else -1).move

def mcts_move(game):
    root = MCTS_Node(game, None, None)
    start_time = time.time()
    while time.time() - start_time < .5:
        node = root
        if node.children == []:
            node.expand()
        node = node.best_child()
        score = node.rollout()
        node.backpropagate(score)
    return root.best_move()

#Alpha-Beta Pruning (for single-player)
def alpha_beta(game, depth, alpha, beta):
    if depth == 0:
        return game.score
    scores = []
    moves = game.getAvailableMoves()
    if len(moves) == 0:
        return game.score
    for move in moves:
        new_game = game.copy()
        new_game.makeMove(*move)
        scores.append(alpha_beta(new_game, depth - 1, alpha, beta))
        if max(scores) >= beta:
            return max(scores)
        alpha = max(alpha, max(scores))
    return max(scores)

def alphabeta_move(game):
    scores = []
    for move in game.getAvailableMoves():
        new_game = game.copy()
        new_game.makeMove(*move)
        scores.append(alpha_beta(new_game, 1, float("-inf"), float("inf")))
    return game.getAvailableMoves()[scores.index(max(scores))]

def random_move(game):
    return choice(game.getAvailableMoves())

def play_game(algorithm):
    game = Blocks()
    while not game.gameOver:
        move = algorithm(game)
        game.makeMove(*move)
    return game.score

#Multiprocessed search to get data
from multiprocessing import Pool
def test_algorithm(algorithm, n, process_count):
    pool = Pool(process_count)
    return pool.map(play_game, [algorithm] * n)

#Test algorithms
def main():
    print("Testing random... ")
    random_scores = test_algorithm(random_move, 100, 4)
    print("Testing DFS... ")
    dfs_scores = test_algorithm(bfs_move, 100, 4)
    print("Testing MCTS... ")
    mcts_scores = test_algorithm(mcts_move, 100, 4)
    print("Testing Alpha-Beta... ")
    alphabeta_scores = test_algorithm(alphabeta_move, 100, 4)

    print("Random scores: ", random_scores)
    print("DFS scores: ", dfs_scores)
    print("MCTS scores: ", mcts_scores)
    print("Alpha-Beta scores: ", alphabeta_scores)

    import matplotlib.pyplot as plt

    #Box-and-whisker plot
    plt.boxplot([random_scores, dfs_scores, mcts_scores, alphabeta_scores])
    plt.xticks([1, 2, 3, 4], ["Random", "DFS", "MCTS", "Alpha-Beta"])
    plt.ylabel("Score")
    plt.title("Scores of different algorithms")

    plt.show()

import uuid

#Play a game with MCTS search and save the data to be used for training
def play_game(a):
    game = Blocks()
    uid = uuid.uuid4()
    states = []
    while not game.gameOver:
        move = mcts_move(game)
        game.makeMove(*move)
        states.append(game.fen())
    final_score = game.score
    print(final_score)
    #Save data
    with open("./training_data/" + str(uid) + ".txt", "w") as f:
        f.write("\n".join([x + "$" + str(final_score) for x in states]))

    

#Multiprocessed MCTS search to get data
def collect_training_data():
    from multiprocessing import Pool
    pool = Pool(8)
    pool.map(play_game, [None] * 1000)


if __name__ == "__main__":
    collect_training_data()
