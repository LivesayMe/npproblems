from blocks import Blocks
from random import choice
import time
# import tensorflow as tf
import numpy as np
import os
# from tensorflow.keras.layers import Dense, Flatten, Conv2D, MaxPooling2D, Dropout
# from tensorflow.keras import Model
# from tensorflow.keras.models import load_model
# from tensorflow.keras.optimizers import Adam
# from tensorflow.keras.losses import MeanSquaredError
# from tensorflow.keras.metrics import MeanAbsoluteError
from blocks import validBlocks

def format_state(s):
    state = s.grid

    #Get indices of tiles
    tile_indexes = []
    for i in range(len(s.availableBlocks)):
        for j in range(len(validBlocks)):
            if s.availableBlocks[i] == validBlocks[j]:
                tile_indexes.append(j)
                break
    
    #Convert tile_indexes to a 1-hot array
    tile_indexes = np.array([1 if i in tile_indexes else 0 for i in range(len(validBlocks))])

    #Pad tile_indexes to 64x1 array and reshape to 8x8x1
    tile_indexes = np.pad(tile_indexes, (0, 64 - len(tile_indexes)), 'constant')

    #Combine state and tile_indexes
    state = np.dstack((state, tile_indexes.reshape((8, 8, 1))))

    return state

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
        return max(self.children, key = lambda child: child.wins/child.visits if child.visits > 0 else -1)

def mcts_move(game, agent, root=None, max_time=.75):
    if root is None:
        root = MCTS_Node(game, None, None)
    
    start_time = time.time()
    count = 0
    while time.time() - start_time < max_time:
        node = root
        if node.children == []:
            node.expand()
        node = node.best_child()
        score = node.rollout(agent)
        node.backpropagate(score)
        count += 1
    print("Explored " + str(count) + " nodes")

    return root.best_move()

import uuid

#Play a game with MCTS search and save the data to be used for training
def play_game(agent, file_dir = "./training_data", save=True):
    uid = uuid.uuid4()
    states = []
    scores = []
    root = MCTS_Node(Blocks(), None, None)
    while not root.state.gameOver:
        move = mcts_move(root.state, agent, root)

        root = move
        root.parent = None #Don't back propagate to root

        states.append(root.state.fen())
        scores.append(root.state.score)
    final_score = root.state.score

    #Save data
    if save:
        with open(file_dir + "/" + str(uid) + ".txt", "w") as f:
            for i in range(len(states)):
                points_from_state = final_score - scores[i]
                if i <= len(states) - 1:
                    f.write(states[i] + "$" + str(points_from_state) + "\n")
                else:
                    f.write(states[i] + "$" + str(points_from_state))
    
    return final_score


def collect_training_data(agent, iteration, game_count):
    #Create directory for training data
    if not os.path.exists("./training_data_" + str(iteration+1)):
        os.mkdir("./training_data_" + str(iteration+1))

    #Play games
    for i in range(game_count):
        if i%10 == 0:
            print("Playing game " + str(i))
        play_game(agent, file_dir = "./training_data_" + str(iteration+1))


def evaluate_agent(agent, n):
    scores = [play_game(agent, save=False) for _ in range(n)]
    return (np.mean(scores), np.std(scores))

def play_mcts_game():
    root = MCTS_Node(Blocks(), None, None)
    while not root.state.gameOver:
        move = mcts_move(root.state, None, root, max_time=2)
        root = move
        root.parent = None #Don't back propagate to root
        root.state.printGrid()

#Set up flask server for game rules and AI
from flask import Flask, request, jsonify
from flask_cors import CORS
app = Flask(__name__)
CORS(app)

block_list = [choice(validBlocks) for _ in range(1000)]
block_count = 0
ai_block_count = 0

@app.route("/new_game", methods=["GET"])
def new_game():
    game = Blocks()
    return jsonify(game.fen())

@app.route("/available_moves", methods=["POST"])
def available_moves():
    game = Blocks()
    game.fromFen(request.args.get("fen"))
    return jsonify(game.getAvailableMoves())

@app.route("/make_move", methods=["POST"])
def make_move():
    global block_count, block_list
    game = Blocks()
    #Get JSON data from request
    json_data = request.get_json()

    game.fromFen(json_data["fen"])
    game.makeMove(json_data["block"], (json_data["x"], json_data["y"]))

    #If the game just refreshed the blocks, replace them with blocks from the block list
    if len(game.availableBlocks) == 3:
        game.availableBlocks = block_list[block_count:block_count+3]
        block_count += 3

    return jsonify({
        "fen": game.fen(),
        "score": game.score,
    })

@app.route("/score", methods=["POST"])
def score():
    game = Blocks()
    game.fromFen(request.args.get("fen"))
    return jsonify(game.score)

@app.route("/game_over", methods=["POST"])
def game_over():
    game = Blocks()
    game.fromFen(request.args.get("fen"))
    return jsonify(game.gameOver)

@app.route("/mcts_move", methods=["POST"])
def mcts_move_serve():
    global ai_block_count, block_list
    game = Blocks()
    #Get JSON data from request
    json_data = request.get_json()

    game.fromFen(json_data["fen"])
    root = MCTS_Node(game, None, None)
    move = mcts_move(game, None, root, max_time=2)
    game.makeMove(*move.move)

    if len(game.availableBlocks) == 3:
        game.availableBlocks = block_list[ai_block_count:ai_block_count+3]
        ai_block_count += 3

    return jsonify({
        "fen": game.fen(),
        "score": game.score,
        })


if __name__ == "__main__":
    app.run()
