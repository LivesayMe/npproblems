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