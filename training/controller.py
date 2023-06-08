from model import load_data, format_data, create_model, train_model
from training import collect_training_data, evaluate_agent
import matplotlib.pyplot as plt
def main(epochs, checkpoint=0):
    model = create_model()
    prev_best = 1
    prev_agent = 1
    best_model = model
    scores = []
    for i in range(checkpoint, checkpoint + epochs):
        print("Collecting data for epoch " + str(i+1) + "...")
        #Collect training data
        collect_training_data(best_model, i, 20)

        print("Training model for epoch " + str(i+1) + "...")
        #Load training data
        data = load_data("./training_data_" + str(i+1) + "/")

        #Format data for training
        x, y = format_data(data)

        #Train the model
        train_model(model, x, y, i)

        #Evaluate the model
        score, std = evaluate_agent(model, 10)
        scores.append(score)

        if score > prev_best:
            model.save_weights("model.h5")
            print("Agent %s beat the previous best agent %s with a score of %s to %s" % (i, prev_agent, score, prev_best))
            prev_agent = i
            prev_best = score
            best_model = model
        else:
            print("Agent %s did not beat the previous best agent %s with a score of %s to %s" % (i, prev_agent, score, prev_best))

    plt.plot(scores)
    plt.show()

    print(scores)

if __name__ == "__main__":
    main(10)