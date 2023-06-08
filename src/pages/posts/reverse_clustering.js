import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import img1 from "./content/download.png";
import ReactAudioPlayer from 'react-audio-player';
import React, { useEffect, useState } from "react";
import Latex from 'react-latex';

let reverse_clustering = {
    title: "Reverse Clustering",
    date: "2021-08-01",
    categories: ["Machine Learning", "Lyla Loom"],
    id: 1,
    body: {
        type: "markdown",
        content: (
            <Box>
                <Typography variant="h4">
                    Introduction
                </Typography>
                <Typography variant="body1">
                    Last week while working on Lyla Loom I had the realization that I could use L2 distance to determine outfit quality rather than a feed-forward neural network. This realization came off the back of me reevaluating how the article prediction network was working, and realizing that essentially there were two outfit embeddings as inputs, and it was tasked with determining some information about how good one fit the other. Now L2 distance isn't a perfect proxy for this network, since the network was also supposed to contain information about outfits in general. For example, if a user's average liked outfit was neon striped pleather, and the outfit we were considering was also neon striped pleather it would have still output a low value, since even though it was a great match it didn't follow the overall trend.
                    <br/>
                    After some consideration though I think this is incorrect. Even if it is against the overall trend, it should still suggest that it is a good outfit. The huge benefit to using L2 distance over a feed forward network is speed. I use simulated annealing to generate outfits, but because of latency constraints am only able to sample 5 or so outfits, significantly reducing the quality of the output. L2 distance is so fast I can sample 1000's of outfits. The other benefit L2 distance has is that it lends itself naturally to user presets such as "formal", "casual", "business casual", etc. I can simply represent the different styles as different centers of clusters, then when a user wants to generate an outfit for I given preset I use distance to the preset's center as the fitness function. This approach however requires clustering the outfits, which normally would be easy. However in Lyla Loom, the user never gives "positive" feedback such as a "like", only negative feedback(clicking the regenerate button).
                    <br/>
                    This leads to the task that this post is about, reverse clustering. How do you find the centers of some clusters when you only have negative feedback? Or at least that was my original question, because as it turns out the question is malformed. This blog post is about how I came to realize that just because a question is elegant doesn't mean it is useful.
                    <br/>
                    Expressed formally the task was to find <Latex>Centers $C_1,C_2,...,C_k$,and points $P_1, P_2,...,P_n$</Latex> that maximize the function
                    <Latex throwOnError={true}>$\sum_i^n \sqrt &#123; F(P_i)-P_i^2 &#125;$  </Latex>
                    Where <Latex>$F(P_i)$ returns the nearest Center to $P_i$.</Latex> This is the same formulation as for traditional clustering except that we are trying to maximize rather than minimize.
                    <br/>
                    Traditional k-means clustering fails, because we can't rely on the fact that the center of a cluster is simply the average of the cluster.
                </Typography>

                <Typography variant="h4">
                    Developing intuition
                </Typography>
                <Box>
                    My first thought was to try and get some intuition for the problem. So I wrote a brute force solution for the k=1 and k=2 cases.
                    <Demo/>
                </Box>
                <Typography variant="body1">
                    The first thing I noticed was that the solution for k=2 was the same as k=1. The second cluster is placed in the exact same place as the first cluster. When I thought about it, I realized that I was foolish to think that there could be optimal solutions with different centers.
                    Proof by contradiction: assume that there exists an arrangement of points such that the optimal solution for k &gt; 2 has centers at different points. If none of the points belong to cluster C, then we can move the cluster to the same location as any other cluster and treat the problem as having k-1 clusters, without changing the solution since if the distance between a point and two clusters is tied, we can choose which it belongs to.
                    If there exists a cluster such that at least one, but not all of the points belong to, then <Latex throwOnError={true}>$\exists p_i $ s.t. $ F(p_i) = C_1$. If $C_1$ didn't exist then by definition $F(p_i)$ would be a different center further away than $C_1$. This is true for all points $F(p)=C_1$. We can effectively make $C_1$ not exist by placing it in the exact same location as a different center, thus reducing the problem to have k-1 centers. This contradicts the initial assumption that there exists an optimal solution where there are &gt; 2 centers in different locations.</Latex>
                </Typography>

                <Typography variant="h4">
                    The Right Question
                </Typography>
                <Typography variant="body1">
                    With the wrong question out of the way, we can now ask the write question. Even in the k=1 case, finding the correct center is very difficult. Is there a faster way of doing it? Brute forcing requires <Latex>$O(m^d)$</Latex> time where d is the dimensionality of the problem and m is the size of the bounds. You know a solution is really bad when the factor for the actual input (the points) is asymptotically insignificant.
                    After spending some time with it I couldn't come up with a solution, so I turned to approximate solutions.
                </Typography>
                <Typography variant="h4">
                    Particle Swarm Optimization
                </Typography>
                <Typography variant="body1">
                    Particle Swarm Optimization (PSO) is an optimization technique that is inspired by the behavior of birds flocking. It is a population based algorithm, where each particle is a potential solution to the problem. Each particle has a velocity and a position. 
                    At each iteration, the particle's velocity is updated according to the following formula:
                    <Latex throwOnError={true}>$v_i = \gamma v_i + \alpha r_p (p_i-x_i) + \beta r_g (g-x_1)$. Where $r_p, r_g$ are random numbers uniformly sampled over (0,1), $x_1$ is the ith agent's current position, $v_i$ is the ith agents velocity, $p_i$ is the ith agent's personal best, g is the global best, and $\alpha, \beta, \gamma$ are hyperparameters representing personal exploitation, social exploitation, and exploration respectively. </Latex>
                    In simpler terms the velocity is updated by a combination of the particle's current velocity, its personal best, and the global best. The particle's position is then updated by adding the velocity to the current position.
                </Typography>
                <Typography variant ="body1">
                    So let's see how PSO performs in the problem.
                    <PSO/>
                    It seems like it performs just as well as brute force search, but it is much faster, and it's complexity doesn't care about the size of the solution space or it's dimensionality so it scales much better for our use case where there are 1000+ dimensions.
                    
                    However this is where the problem breaks down. What we are actually trying to find is the center of a distribution in the space of all the outfits, representing the probability that a user will like a given outfit. 
                    <br/>
                    We have samples from the inverse of this distribution. The distribution of all of the bad outfits, which should be mostly uniform with a negative normal distribution at one point in it. The center of that negative normal distribution would be the center of the distribution for the good outfits. 
                    <br/>
                    Consider the probability of a given point being chosen given the center of this negative normal distribution(this applies in higher dimensions as well). It's predicted "fitness" is 
                    <Latex throwOnError={true}>$$P(x) = 1-(1/ \sqrt(2\pi) e^(-(x-C)^2)/(2\sigma^2))$$</Latex>, which essentially reduces to a scaled distance metric (x-C)^2. Meaning that the center of this distribution will always be one of the corners of the solution space (as evidence in the demos above).
                    <br/>
                    The issue that this all comes down to is that not all of the points are equally descriptive of the distribution. With each point our guess gets better, so our next recommendation will be on the new point, but if the user doesn't like that the center we predicted shouldn't be moved as much as with the first point. Each successive sample should move the center less and less. 
                    Which leads to the solution that I actually ended up using.

                    <Latex throwOnError={true}>$$C_n=C_o - \alpha (p - C_o)$$. Where $C_o$ is the old center, $p$ is the latest point, and $\alpha$ is the learning rate which decreases with each point.</Latex> Essentially saying that for each new negative sample we move the center directly away from it by a smaller amount for each point.
                    <br/>
                    Sometimes the simplest solutions are the best. The benefit here is that we can pick up on actions from the user on when to alter the learning rate. If the user regenerates many times in a row, we can increase the learning rate to move the center faster. If the user starts rarely regenerating then we can significantly decrease the learning rate, since it seems that we already found what the user wants.
                    
                </Typography>
            </Box>
        )
    }
}

function PSO() {
    const [seed, setSeed] = useState(2);

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
            }}>
                <Grid title={"Sample Points"} seed={seed}/>

                <Grid PSO={true} title="PSO" seed={seed} show_center={true}/>
            </Box>

            <Button onClick={() => setSeed(seed + 1)}>Randomize</Button>
        </Box>
    )
}

function Demo() {
    const [seed, setSeed] = useState(2);

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-around",
            }}>
                <Grid title={"Sample Points"} seed={seed}/>

                <Grid show_center = {true} title="K=1" seed={seed}/>

                <Grid  show_center = {true} title="K=2" seed={seed} k={2}/>
            </Box>

            <Button onClick={() => setSeed(seed + 1)}>Randomize</Button>
        </Box>
    )
}

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function Grid(props) {
    const [points, setPoints] = useState([]);
    const [centers, setCenters] = useState([]);
    const clusterColors = ["red", "blue", "green", "yellow", "orange", "purple", "pink", "brown", "black", "grey"];

    const { width = 10, height = 10, cellSize = 1, k = 1, show_center = false, title="", seed=1  } = props;

    useEffect(() => {
        //Initialize random number generator
        let rng = mulberry32(seed);

        generatePoints(rng);
    }, [props.seed]);

    const solve_pso = (agent_count, iteration_count, alpha, beta, omega, fitness, rng) => {
        const val = (position) => {
            let sol = [];
            for (let i = 0; i < k; i ++) {
                sol.push({
                    x: Math.floor(position[i*2]),
                    y: Math.floor(position[i*2 + 1]),
                })
            }
            for (let i = 0; i < k; i ++) {
                if (sol[i].x >= width || sol[i].x < 1 || sol[i].y >= height || sol[i].y < 1)
                {
                    return -10;
                }
            } 
            return fitness(sol);
        }
        //Initialize agents
        let agent_size = k * 2;
        let agents = [];
        let globalBestValue = -1;
        let globalBest = null;
        for(let i = 0; i < agent_count; i++)
        {
            let position = []
            let velocity = [];
            for(let q = 0; q < agent_size; q++)
            {
                position.push(rng() * width)
                velocity.push(rng() * 2 - 1)
            }
            

            let f = val(position)
            agents.push({
                position: position,
                velocity: velocity,
                best: position,
                bestValue: f,
            });

            if (f > globalBestValue) {
                globalBestValue = f;
                globalBest = position;
            }
        }

        for(let i = 0; i < iteration_count; i++)
        {
            //Update positions
            for(let q = 0; q < agent_count; q++)
            {
                let agent = agents[q];
                for(let j = 0; j < agent_size; j++)
                {
                    agent.velocity[j] = omega * agent.velocity[j] + alpha * rng() * (agent.best[j] - agent.position[j]) + beta * rng() * (globalBest[j] - agent.position[j]);
                    agent.position[j] += agent.velocity[j];
                }
                let f = val(agent.position);
                if (f > agent.bestValue) {
                    agent.bestValue = f;
                    agent.best = agent.position;
                }
                if (f > globalBestValue) {
                    globalBestValue = f;
                    globalBest = agent.position;
                }
            }
        }
        
        let sol = [];
        for (let i = 0; i < k; i ++) {
            sol.push({
                x: Math.floor(globalBest[i*2]),
                y: Math.floor(globalBest[i*2 + 1]),
            })
        }
        return sol;
    }

    const brute_force = (error, rng) => {
        
        const iterate_possibilities = (remaining, centers) => {
            if (remaining == 1){
                let best = null;
                let bestFitness = -1;
                for (let x = 0; x < width; x++)
                {
                    for (let y = 0; y < height; y++)
                    {
                        let sol = [...centers];
                        sol.push({x: x, y: y});
                        let f = error(sol);
                        if (f > bestFitness) {
                            bestFitness = f;
                            best = sol;
                        }
                    }
                }
                return {best: best, bestFitness: bestFitness};
            } else {
                let best = null;
                let bestFitness = -1;
                for (let x = 0; x < width; x++)
                {
                    for (let y = 0; y < height; y++)
                    {
                        let sol = [...centers];
                        sol.push({x: x, y: y})
                        let f = iterate_possibilities(remaining - 1, sol);
                        if (f.bestFitness > bestFitness) {
                            bestFitness = f.bestFitness;
                            best = f.best;
                        }
                    }
                }
                return {best: best, bestFitness: bestFitness};
            }
            
        }
        let f = iterate_possibilities(k, []);
        return f.best;
    }

    // Generate 10 random points
    const generatePoints = (rng) => {
        
        const newPoints = [];
        for (let i = 0; i < 10; i++) {
            newPoints.push({
                x: Math.floor(rng() * width),
                y: Math.floor(rng() * height),
            });
        }

        const distance = (point1, point2) => {
            return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
        }

        const error = (centers) => {
            let error = 0;
            newPoints.forEach(point => {
                let nearest_center = centers.sort((a, b) => distance(a, point) - distance(b, point))[0];
                error += distance(nearest_center, point);
            });
            return error;
        }

        if (show_center) {
            if(props.pso) {
                setCenters(solve_pso(100, 10, 0.5, 0.5, 0.5, error, rng));
            } else {
                if (k==1) {
                    //All points belong to the same cluster
                    newPoints.forEach(point => {
                        point.cluster = 0;
                        point.color = clusterColors[0];
                    });

                    //Iterate over all possible points and find the one that is the furthest away
                    let maxError = 0;
                    let maxErrorPoint = null;
                    for (let x = 0;x < width; x += cellSize) {
                        for (let y = 0;y < height; y += cellSize) {
                            let point = {x, y};
                            let errorVal = error([point]);
                            if (errorVal > maxError) {
                                maxError = errorVal;
                                maxErrorPoint = point;
                            }
                        }
                    }
                    setCenters([maxErrorPoint]);
                } else {

                    // let newcenters = solve_pso(100, 10, 0.5, 0.5, 0.5, error, rng);
                    let newcenters = brute_force(error, rng);
                    newPoints.forEach(point => {
                        let nearest = -1;
                        let nearestDistance = 100000;
                        for (let q = 0; q < newcenters.length; q++) {
                            let d = distance(newcenters[q], point);
                            if (d < nearestDistance) {
                                nearestDistance = d;
                                nearest = q;
                            }
                        }

                        point.cluster = nearest;
                        point.color = clusterColors[nearest];
                    });

                    setCenters(newcenters);

                }
            }
        }
        setPoints(newPoints);
    };

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <Typography variant="h6">
                {title}
            </Typography>

            <div style={{ 
                border: "1px solid black",
                width: (width + 2)*10 + "px",
                padding: "5px",
            }}>
                <svg width={(width + 2)*10} height={(height + 2)*10}>
                    {points.map((point, i) => (
                        <circle
                            key={i}
                            cx={(point.x + 1)*10}
                            cy={(point.y + 1)*10}
                            r={cellSize*10 / 4}
                            fill={point.color}
                        />
                    ))}
                    {show_center && centers.map((center, i) => (
                        <circle
                            key={i}
                            cx={(center.x + 1)*10}
                            cy={(center.y + 1)*10}
                            r={cellSize*10 / 2}
                            fill={clusterColors[i]}
                        />
                    ))}
                </svg>
            </div>
        </Box>
    );
}


export default reverse_clustering;