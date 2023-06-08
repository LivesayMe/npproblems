# CNN model for estimating the number of points that can still be gotten from a given state
import tensorflow as tf
import numpy as np
import os
from tensorflow.keras.layers import Dense, Flatten, Conv2D, MaxPooling2D, Dropout
from tensorflow.keras import Model
from tensorflow.keras.callbacks import ModelCheckpoint
from tensorflow.keras.models import load_model
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.losses import MeanSquaredError
from tensorflow.keras.metrics import MeanAbsoluteError
from tensorflow.keras.utils import plot_model
from blocks import validBlocks
import matplotlib.pyplot as plt

#Example of a line from a training data file
#1110000011110000011100110110011001100000111110000011111000000000#010|111|#111|100|#$8
#The first part is the state, the second part it the available moves (delimeted by #), the third part is the points that can still be gotten from that state

#Load training data
def load_data(path):
    data = []
    for filename in os.listdir(path):
        with open(path + filename) as f:
            for line in f:
                lines = line.split("#")
                #Get state
                state = lines[0]
                #Convert state to a 2D (8x8) array
                state_lines = [int(x) for x in state]
                state = np.array(state_lines).reshape((8, 8))

                #Get score
                score = int(lines[-1][1:])

                #Get available moves
                moves = lines[1:-1]

                #Get the index of the move in validBlocks
                move_indexes = []
                for m in range(len(moves)):
                    move_lines = moves[m].split("|")[:-1]
                    width = len(move_lines[0])
                    height = len(move_lines)
                    for i in range(len(validBlocks)):
                        if len(validBlocks[i]) == height and len(validBlocks[i][0]) == width:
                            for x in range(height):
                                if move_lines[x] != validBlocks[i][x]:
                                    break
                            
                            move_indexes.append(i)
                            break
                
                #Convert move_indexes to a 1-hot array
                move_indexes = np.array([1 if i in move_indexes else 0 for i in range(len(validBlocks))])

                #Add the state, move_indexes and score to the data
                data.append((state, move_indexes, score))

    return data

#Create the model
def create_model():
    model = tf.keras.Sequential([
        Conv2D(32, (2, 2), activation='relu', input_shape=(8, 8, 2), padding='same'),
        MaxPooling2D((2, 2), padding='same'),
        Conv2D(64, (2, 2), activation='relu', padding='same'),
        MaxPooling2D((2, 2), padding='same'),
        Flatten(),
        Dense(64, activation='relu'),
        Dense(1, activation='linear')
    ])

    model.compile(optimizer=Adam(learning_rate=0.001), loss=MeanSquaredError(), metrics=[MeanAbsoluteError()])
    return model

#Format the data for training
def format_data(data):
    #8x8x2 array, first channel is the state, second channel is the available moves (1-hot encoded)
    x = np.zeros((len(data), 8, 8, 2))
    #1D array of scores
    y = np.zeros((len(data), 1))
    for i in range(len(data)):
        x[i, :, :, 0] = data[i][0]
        #Pad the move_indexes with 0s to make it 64 long
        x[i, :, :, 1] = np.pad(data[i][1], (0, 64 - len(data[i][1])), 'constant').reshape(8,8)

        y[i] = data[i][2]
    
    return x, y

#Train the model
def train_model(model, x, y, i):
    #Save the model with the lowest validation loss
    checkpoint = ModelCheckpoint("model-" + str(i) + ".h5", monitor='val_loss', verbose=1, save_best_only=True, mode='min')
    callbacks_list = [checkpoint]

    #Train the model
    model.fit(x, y, epochs=30, validation_split=0.1, callbacks=callbacks_list)

#Load the model
def load_model():
    model = create_model()
    model.load_weights("model-2.h5")
    return model

#Plot the model
def plot_model(model):
    plot_model(model, to_file='model.png', show_shapes=True, show_layer_names=True)

def inference(model, state):
    return model.predict(state.reshape(1, 8, 8, 2))


def main():
    #Load training data
    data = load_data("./training_data_2/")

    #Format data for training
    x, y = format_data(data)

    #Create the model
    model = create_model()

    #Train the model
    train_model(model, x, y, 2 )


if __name__ == "__main__":
    main()