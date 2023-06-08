import { Button, Typography } from "@mui/material";
import { Box } from "@mui/system";
import React, {useEffect, useState} from "react";
import Latex from "react-latex";

import image1 from "./content/Screenshot 2023-04-16 185319.png";

function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function TSP(props) {

    const [points, setPoints] = useState([]);
    const [edges, setEdges] = useState([]);
    const [highlighted, setHighlighted] = useState([]);
    const [gen, setGen] = useState(null);
    const [convexEdges, setConvexEdges] = useState([]);

    useEffect(() => {
        let rng = mulberry32(props.seed);
        reset(rng);
    }, []);

    useEffect(() => {
        let rng = mulberry32(props.seed);
        reset(rng);
    }, [props.seed]);

    const reset = (rng) => {
        if (rng == null || typeof rng !== 'function' ) {
            rng = mulberry32(props.seed);
        }
        let p = generatePoints(rng, props.count);
        setPoints(p);

        if (props.algorithm === "bruteforce") {
            let edges = bruteForce(p);
            setEdges(edges);
        }

        if(props.intersect) {
            let edges = bruteForce(p);

            //Pick 2 random edges that don't share a point
            let edge1 = edges[Math.floor(rng() * edges.length)];
            let edge2 = edges[Math.floor(rng() * edges.length)];
            while (edge1[0] === edge2[0] || edge1[0] === edge2[1] || edge1[1] === edge2[0] || edge1[1] === edge2[1]) {
                edge2 = edges[Math.floor(rng() * edges.length)];
            }

            //Highlight the points
            setHighlighted([edge1[0], edge1[1], edge2[0], edge2[1]]);

            //Flip the points to force an intersection
            let temp = edge1[1];
            edge1[1] = edge2[0];
            edge2[0] = temp;

            setEdges(edges)
        }

        if (props.convexhull) {
            //Find the convex hull
            let hull = convexHull(p);
            
            //Convert points to indexes
            let hullIndexes = [];
            for (let i = 0; i < hull.length; i++) {
                hullIndexes.push(p.indexOf(hull[i]));
            }

            //Highlight the points
            setHighlighted(hullIndexes);

            //Convert points into index pairs
            let edges = [];
            for (let i = 0; i < hullIndexes.length - 1; i++) {
                edges.push([hullIndexes[i], hullIndexes[i + 1]]);
            }
            edges.push([hullIndexes[hullIndexes.length - 1], hullIndexes[0]]);
            setConvexEdges(edges);
        }

        if (props.mst) {
            let distance = (a, b) => {
                return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
            }
            let edges = mst(p, distance);

            //Convert pairs of points into pairs of indexes
            for (let i = 0; i < edges.length; i++) {
                edges[i][0] = p.indexOf(edges[i][0]);
                edges[i][1] = p.indexOf(edges[i][1]);
            }

            //Highlight points with odd degree
            let degrees = [];
            for (let i = 0; i < p.length; i++) {
                degrees.push(0);
            }

            for (let i = 0; i < edges.length; i++) {
                degrees[edges[i][0]]++;
                degrees[edges[i][1]]++;
            }

            let odd = [];
            for (let i = 0; i < degrees.length; i++) {
                if (degrees[i] % 2 === 1) {
                    odd.push(i);
                }
            }

            setHighlighted(odd);

            setEdges(edges);
        }

        if (props.perfectmatching) {
            let distance = (a, b) => {
                return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
            }
            let cur_edges = mst(p, distance);
            let indexedEdges = [];
            // //Convert pairs of points into pairs of indexes
            for (let i = 0; i < cur_edges.length; i++) {
                indexedEdges.push([p.indexOf(cur_edges[i][0]), p.indexOf(cur_edges[i][1])]);
            }

            //Highlight points with odd degree
            let degrees = [];
            for (let i = 0; i < p.length; i++) {
                degrees.push(0);
            }

            for (let i = 0; i < cur_edges.length; i++) {
                degrees[indexedEdges[i][0]]++;
                degrees[indexedEdges[i][1]]++;
            }

            let odd = [];
            for (let i = 0; i < degrees.length; i++) {
                if (degrees[i] % 2 === 1) {
                    odd.push(i);
                }
            }

            //Remove all points that aren't odd
            setPoints(odd.map(i => p[i]));

            let matching = perfectMatching(odd.map(i => p[i]));
            
            //Convert points into pairs of indexes
            let edges = [];
            for (let i = 0; i < matching.length; i+=2) {
                edges.push([odd.indexOf(p.indexOf(matching[i])), odd.indexOf(p.indexOf(matching[i+1]))]);
            }

            setEdges(edges);
        }

        if (props.augmented) {
            let distance = (a, b) => {
                return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
            }
            let cur_edges = mst(p, distance);
            let indexedEdges = [];
            // //Convert pairs of points into pairs of indexes
            for (let i = 0; i < cur_edges.length; i++) {
                indexedEdges.push([p.indexOf(cur_edges[i][0]), p.indexOf(cur_edges[i][1])]);
            }

            //Highlight points with odd degree
            let degrees = [];
            for (let i = 0; i < p.length; i++) {
                degrees.push(0);
            }

            for (let i = 0; i < cur_edges.length; i++) {
                degrees[indexedEdges[i][0]]++;
                degrees[indexedEdges[i][1]]++;
            }

            let odd = [];
            for (let i = 0; i < degrees.length; i++) {
                if (degrees[i] % 2 === 1) {
                    odd.push(i);
                }
            }

            let matching = perfectMatching(odd.map(i => p[i]));
            
            //Convert points into pairs of indexes
            let edges = [];
            for (let i = 0; i < matching.length; i+=2) {
                edges.push([p.indexOf(matching[i]), p.indexOf(matching[i+1])]);
            }

            //Add the edges from the matching to the MST
            for (let i = 0; i < indexedEdges.length; i++) {
                edges.push(indexedEdges[i]);
            }

            setEdges(edges);
        }

        if (props.christofides) {
            let distance = (a, b) => {
                return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
            }
            let cur_edges = mst(p, distance);
            let indexedEdges = [];
            // //Convert pairs of points into pairs of indexes
            for (let i = 0; i < cur_edges.length; i++) {
                indexedEdges.push([p.indexOf(cur_edges[i][0]), p.indexOf(cur_edges[i][1])]);
            }

            //Highlight points with odd degree
            let degrees = [];
            for (let i = 0; i < p.length; i++) {
                degrees.push(0);
            }

            for (let i = 0; i < cur_edges.length; i++) {
                degrees[indexedEdges[i][0]]++;
                degrees[indexedEdges[i][1]]++;
            }

            let odd = [];
            for (let i = 0; i < degrees.length; i++) {
                if (degrees[i] % 2 === 1) {
                    odd.push(i);
                }
            }

            let matching = perfectMatching(odd.map(i => p[i]));
            
            //Convert points into pairs of indexes
            let edges = [];
            for (let i = 0; i < matching.length; i+=2) {
                edges.push([p.indexOf(matching[i]), p.indexOf(matching[i+1])]);
            }

            //Add the edges from the matching to the MST
            for (let i = 0; i < indexedEdges.length; i++) {
                edges.push(indexedEdges[i]);
            }

            let tour = eulerianTour(p, edges);

            //Shortcuts
            let visited = [];
            let finalTour = [];
            for (let i = 0; i < tour.length; i++) {
                if (!visited.includes(tour[i])) {
                    finalTour.push(tour[i]);
                    visited.push(tour[i]);
                }
            }

            //Convert tour indices to pairs
            let finalEdges = [];
            for (let i = 0; i < finalTour.length - 1; i++) {
                finalEdges.push([finalTour[i], finalTour[i+1]]);
            }

            finalEdges.push([finalTour[finalTour.length - 1], finalTour[0]]);

            setEdges(finalEdges);


        }

        if (props.karp) {
            let edges = karpTSP(p);
            console.log(edges);
        }
    }

    const karpTSP = (p) => {
        let dist = (a, b) => {
            return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
        }

        let n = p.length;

        // Computes the length of the shortest TSP tour that visits all points in Y.
        function tour(Y) {
            const m = Y.length;
            if (m === 0) {
                return 0;
            } else if (m === 1) {
                return 2 * dist(Y[0], Y[0]);
            } else if (m === 2) {
                return dist(Y[0], Y[1]) + dist(Y[1], Y[0]);
            } else {
                // Computes the minimum weight matching for Y.
                const d = new Array(m*m);
                for (let i = 0; i < m; i++) {
                    for (let j = 0; j < m; j++) {
                    d[i*m+j] = dist(Y[i], Y[j]);
                    }
                }
                const matching = minWeightMatching(d, m);
                
                // Computes the shortest TSP tour that visits all points in Y, using the matching.
                const perm = new Array(m);
                for (let i = 0; i < m; i++) {
                    perm[i] = i;
                }
                for (let i = 0; i < m/2; i++) {
                    const j = matching[i];
                    perm[2*i+1] = perm[j];
                    perm[j] = perm[2*i+2];
                }
                let len = 0;
                for (let i = 0; i < m; i++) {
                    len += dist(Y[perm[i]], Y[perm[(i+1)%m]]);
                }
                return len;
            }
        }

        return tour(p);
    }

    function minWeightMatching(d) {
        console.log(d);
    }

    const eulerianTour = (p, edges) => {
        // Step 1: Create an adjacency list representation of the graph
        const adjList = [];
        for (let i = 0; i < p.length; i++) {
            adjList.push([]);
        }
        for (const [u, v] of edges) {
            adjList[u].push(v);
            adjList[v].push(u);
        }

        // Step 2: Initialize the stack with an arbitrary vertex
        const stack = [0];

        // Step 3: Initialize the tour with an empty list
        const tour = [];

        while (stack.length > 0) {
            // Step 4: Pop a vertex v from the stack
            const v = stack.pop();

            // Step 5: If v has unexplored edges, push v back onto the stack and explore an unexplored edge
            if (adjList[v].length > 0) {
                const u = adjList[v].shift();
                const uvIndex = edges.findIndex(([i, j]) => i === v && j === u);
                const vuIndex = edges.findIndex(([i, j]) => i === u && j === v);
                stack.push(v);
                edges.splice(uvIndex, 1);
                edges.splice(vuIndex, 1);
                adjList[u] = adjList[u].filter((w) => w !== v);
                stack.push(u);
            }

            // Step 6: Otherwise, add v to the tour
            tour.push(v);
        }

        return tour;
    }

    const perfectMatching = (p) => {
        let distance = (a, b) => {
            return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2);
        }
        //Brute force
        let solutions = permute(p);

        let min = Number.MAX_VALUE;
        let minSolution = null;

        for (let i = 0; i < solutions.length; i++) {
            let solution = solutions[i];
            let cur = 0;
            for (let j = 0; j < solution.length; j+=2) {
                cur += distance(solution[j], solution[j+1]);
            }
            if (cur < min) {
                min = cur;
                minSolution = solution;
            }
        }

        return minSolution;
    }

    //Kruskal's algorithm
    const mst = (p, distance) => {
        //Create edges
        let edges = [];
        for (let i = 0; i < p.length - 1; i++) {
            for (let j = i + 1; j < p.length; j++) {
                edges.push([p[i], p[j], distance(p[i], p[j])]);
            }
        }

        //Sort edges by distance
        edges.sort((a, b) => a[2] - b[2]);

        const parent = [];
        for (let i = 0; i < p.length; i++) {
            parent.push(i);
        }

        let mst = [];
        for (let i = 0; i < edges.length; i++) {
            let root1 = findRoot(p.indexOf(edges[i][0]), parent);
            let root2 = findRoot(p.indexOf(edges[i][1]), parent);
            if (root1 !== root2) {
                mst.push([edges[i][0], edges[i][1]]);
                mergeTrees(root1, root2, parent);
            }
        }

        return mst;
    }

    const findRoot = (node, parent) => {
        while (parent[node] !== node) {
            node = parent[node];
        }
        return node;
    }

    const mergeTrees = (root1, root2, parent) => {
        parent[root1] = root2;
    }


    const convexHull = (points) => {
        //Find the leftmost point
        let leftmost = points[0];
        let leftmostIndex = 0;
        for (let i = 1; i < points.length; i++) {
            if (points[i][0] < leftmost[0]) {
                leftmost = points[i];
                leftmostIndex = i;
            }
        }

        //Sort the points by angle
        let sorted = points.slice(0, leftmostIndex).concat(points.slice(leftmostIndex + 1));
        sorted.sort((a, b) => {
            let angleA = Math.atan2(a[1] - leftmost[1], a[0] - leftmost[0]);
            let angleB = Math.atan2(b[1] - leftmost[1], b[0] - leftmost[0]);
            return angleA - angleB;
        });

        //Find the convex hull
        let hull = [leftmost, sorted[0]];
        for (let i = 1; i < sorted.length; i++) {
            let p = sorted[i];
            while (hull.length > 1 && !isLeftTurn(hull[hull.length - 2], hull[hull.length - 1], p)) {
                hull.pop();
            }
            hull.push(p);
        }

        return hull;
    }

    const isLeftTurn = (a, b, c) => {
        let cross = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
        return cross > 0;
    }

    const generatePoints = (rng, count) => {
        let p = [];
        for (let i = 0; i < count; i++) {
            let x = Math.floor(rng() * props.size * 10);
            let y = Math.floor(rng() * props.size * 10);
            p.push([x, y]);
        }
        return p;
    }

    const bruteForce = (p) => {
        let min = Number.MAX_SAFE_INTEGER;
        let minPath = [];
        let paths = permute(p);
        for (let i = 0; i < paths.length; i++) {
            let path = paths[i];
            let dist = 0;
            for (let j = 0; j < path.length - 1; j++) {
                dist += Math.sqrt(Math.pow(path[j][0] - path[j + 1][0], 2) + Math.pow(path[j][1] - path[j + 1][1], 2));
            }
            //Add last edge
            dist += Math.sqrt(Math.pow(path[path.length - 1][0] - path[0][0], 2) + Math.pow(path[path.length - 1][1] - path[0][1], 2));

            if (dist < min) {
                min = dist;
                minPath = path;
            }
        }

        //Convert points into index pairs
        let minPathEdges = [];
        for (let i = 0; i < minPath.length - 1; i++) {
            let index1 = p.indexOf(minPath[i]);
            let index2 = p.indexOf(minPath[i + 1]);
            minPathEdges.push([index1, index2]);
        }

        //Add last edge
        let index1 = p.indexOf(minPath[minPath.length - 1]);
        let index2 = p.indexOf(minPath[0]);
        minPathEdges.push([index1, index2]);

        return minPathEdges;
    }

    const permute = (arr) => {
        let result = [];
        if (arr.length === 1) {
            result.push(arr);
            return result;
        }
        for (let i = 0; i < arr.length; i++) {
            let first = arr[i];
            let rest = arr.slice(0, i).concat(arr.slice(i + 1));
            let innerPermute = permute(rest);
            for (let j = 0; j < innerPermute.length; j++) {
                let inner = innerPermute[j];
                inner.unshift(first);
                result.push(inner);
            }
        }
        return result;
    }

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
        }}>
            <Typography variant="h6">
                {props.title}
            </Typography>

            {/* Show points and edges */}
            <Box sx={{
            }}>
                <svg width={props.size* 10 + 20} height={props.size* 10 + 20}>
                    {points.map((point, index) => {
                        if (highlighted.includes(index)) {
                            return (
                                <circle cx={point[0] + 10} cy={point[1] + 10} r="5" fill="red" />
                            );
                        }
                        return (
                            <circle cx={point[0] + 10} cy={point[1] + 10} r="5" fill="black" />
                        );
                    })}
                    {edges.map((edge, index) => {
                        
                        return (
                            <line x1={points[edge[0]][0] + 10} y1={points[edge[0]][1] + 10} x2={points[edge[1]][0] + 10} y2={points[edge[1]][1] + 10} stroke="black"/>
                        );
                    })}
                    {convexEdges.map((edge, index) => {
                        return (
                            <line x1={points[edge[0]][0] + 10} y1={points[edge[0]][1] + 10} x2={points[edge[1]][0] + 10} y2={points[edge[1]][1] + 10} stroke="blue"/>
                        );
                    })}
                </svg>
            </Box>
        </Box>
    )
}

function Demo1() {
    const [seed, setSeed] = useState(0);

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
            }}>
                <TSP seed={seed} count={6} size={20} algorithm={"bruteforce"} title={"Optimal"}/>
                <TSP seed={seed} count={6} size={20} algorithm={"bruteforce"} title={"Forced Intersection"} intersect/>
            </Box>
            <Button onClick={() => setSeed(seed + 1)}>
                Generate Points
            </Button>
        </Box>
            
    )
}

function Demo2() {
    const [seed, setSeed] = useState(0);

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
            }}>
                <TSP seed={seed} count={8} size={20} algorithm={"bruteforce"} title={"Convex Hull"} convexhull/>
            </Box>
            <Button onClick={() => setSeed(seed + 1)}>
                Generate Points
            </Button>
        </Box>
            
    )
}

function Demo3() {
    const [seed, setSeed] = useState(0);

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
            }}>
                <TSP seed={seed} count={12} size={20} title={"Points"}/>
                <TSP seed={seed} count={12} size={20} title={"MST"} mst/>
                <TSP seed={seed} count={12} size={20} title={"Perfect Matching"} perfectmatching/>
                <TSP seed={seed} count={12} size={20} title={"Augmented Graph"} augmented/>
                <TSP seed={seed} count={12} size={20} title={"TSP Tour"} christofides/>
            </Box>
            <Button onClick={() => setSeed(seed + 1)}>
                Generate Points
            </Button>
        </Box>
    )
}

function Demo4() {
    const [seed, setSeed] = useState(0);

    return (
        <Box sx={{
            display: "flex",
            flexDirection: "column",
        }}>
            <Box sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                flexWrap: "wrap",
            }}>
                <TSP seed={seed} count={12} size={20} title={"Points"}/>
                <TSP seed={seed} count={12} size={20} title={"MST"} karp/>
            </Box>
            <Button onClick={() => setSeed(seed + 1)}>
                Generate Points
            </Button>
        </Box>
    )
}

let metric_tsp = {
    "title": "An Exploration of Approximation Algorithms for Metric Traveling Salesman Problem",
    "categories": [
        "Algorithms",
        "Traveling Salesman Problem",
    ],
    id: 5,
    "body": {
        "type": "markdown",
        "content": (
            <Box>
                <Typography variant="h5">
                    Introduction
                </Typography>
                <Typography variant="body1">
                Geometric Traveling Salesman Problem (TSP) is a variant of TSP that is concerned with the case where the vertices are points in space. Work has
been done in three areas relating to geometric TSP: properties geometric TSP has that general TSP doesn't, time
complexity of algorithms to find exact solutions to geometric TSP, and approximation algorithms for geometric
TSP.
                </Typography>
                <Typography variant="body1">
                Depending on the type of metric space used, different properties emerge. The most common metric space explored
is Euclidean TSP which uses the euclidean distance, but others include rectilinear TSP using Manhattan distance,
and maximum metric which uses Chebyshev distance.
                </Typography>
                <Typography variant="h5">
                    Euclidean TSP Properties
                </Typography>
                <Typography variant="body1">
                    I want to look at 3 properties that Euclidean TSP has.
                    <ol>
                        <li>The optimum traveling salesman tour in Euclidean TSP does not intersect itself.</li>
                        <li>Let m of n points in the Euclidean TSP define the convex hull of the points. Then the order in which these m points appear in the optimum traveling salesman tour must be the same as the order in which these same poitns appear in the convex hull.</li>
                        <li>Distance between points in Euclidean TSP are often radical.</li>
                    </ol>

                    First some intuition for the first property.
                    <Demo1/>

                    The reason why the path with an intersection will never be optimal comes down to the triangle inequality. Given a triangle abc with hypotenuse ac and distance function d:

                    <Latex>
                            $d(a, b) + d(b, c) \geq d(a, c)$
                    </Latex>

                    If you consider the intersection of the two lines it forms two triangle when on the top and another on the bottom. If the intersection is optimal then the sum of the legs of the triangle formed would have to be less than the hypoenuse (which we are claiming is optimal), but that would violate the triangle inequality. 

                </Typography>

                <Typography variant="body1">
                    The second property follows as a natural conclusion of the first.
                    <Demo2/>
                    Consider a graph with convex hull points a, b, c, and d appearing in that order. If the tour goes from a to c skipping b, then in order for it to return to b it must cross over the segment that connected a and c since by definition a, b, and c are on the convex hull.
                </Typography>

                <Typography variant="body1">
                    The third property follows as a natural conclusion of the distance function used. 
                    Euclidean distance (l2 distance) is defined as the square root of the sum of the squares of the differences of the coordinates of the points. Since the square root of a number is either a integer or a irrational, the distance between two points is only ever an integer if the points form a pythagorean triple.
                    The issue arises from the fact that maintaing precision with all of the radicals is difficult. If you just maintain all of the radicals and then exponentiate to compare distances it can result in up to (n-1) radicals in total, which will take exponential time regardless of the rest of the algorithm. Most techniques instead use rounded precision. There are known bounds on how much precision is required to ensure that a solution is optimal.
                </Typography>

                <Typography variant="h5">
                    Exact Algorithms
                </Typography>
                <Typography variant="body1">
                The decision version of General TSP was proven to be NP-Complete in 1972. In 1977 Christos Papadimitriou
proved that Geometric TSP is also NP-Complete, meaning that it isn't significantly easier than general TSP.
M. R. Garey, R. K. Graham and D. S. Johnson proved the same thing independently.
Papadimitriou proved that euclidean TSP is NP-Complete when using a natural discretized version of euclidean
distance. He proved that euclidean TSP is NP-Complete by reducing Exact Cover to it. The Exact Cover Problem
is as follows: Given a family F of subsets of the finite set U, is there a subfamily F` of 𝐹 , consisting of disjoint
sets, such that 𝐹` covers 𝑈 . Expressed informally, exact cover asks if there exists a collection of sets from F that
contain all of the elements of 𝑈 whilst not sharing any elements between each other.
His proof constructs a series of n 2-chains, joined by 1-chains with m copies of H between two consecutive
2-chains. The n 2-chains correspond to the n sets of the exact cover problem. While the m copies of H correspond
to the m elements in U. The exact construction is beyond the scope of this literature review.
Garey et. al also proved that euclidean TSP with a discretized euclidean distance is NP-Complete. They further
proved that rectilinear TSP using Manhattan distance is NP-Complete, and that TSP using unmodified euclidean
distance is NP-Hard
                </Typography>

                <Typography variant="h5">
                    Approximation Algorithms
                </Typography>
                <Typography variant="body1">
                Most interest has been in trying to find approximation algorithms to Geometric TSP. In this case the distance of the tour is allowed to be within some factor 𝜖 of the optimal tour, bust must run in polynomial time. 
                </Typography>
                <Typography variant="body1">
                    The most famous approximation algorithm for Geometric TSP is the Christofides algorithm. It is a 3/2 approximation algorithm that runs in O(n^3) time, which means that the solution it produces is at worst case only 50% worse than the optimal solution.
                    Given a complete graph G, with verticies V and distance functino d where the triangle inequality holds the algorithm is as follows
                    <ol>
                        <li>Create a MST T of G</li>
                        <li>Let O be the set of vertices with odd degree in T</li>
                        <li>Find a minimum weight perfect matching M in the subgraph of G given by the vertices from O</li>
                        <li>Let H be the union of T and M</li>
                        <li>Find an Eulerian tour C in H</li>
                        <li>Make the tour into a hamiltonian circuit by skipping repeated vertices</li>
                    </ol>
                    A MST is a minimum spanning tree that connects all vertices in a graph with the minimum total weight. A perfect matching is a matching that uses all of the vertices in a graph. An Eulerian tour visits every vertex potentially multiple times. A hamiltonian circuit is a circuit that visits every vertex in a graph exactly once.

                    <Demo3/>

                    Christofides proved that the tour created from this algorithm will be within 3/2 ratio of the optimal tour. 
                </Typography>

                <Typography variant="body1">
                    n 1977 Karp showed that for a special case of euclidean TSP when the points are picked uniformly and indepen-
                    dently from the unit square, the fixed dissection heuristic with high probability finds tours whose cost is within a
                    factor 1 + 1
                    𝜖 of optimal (where 𝜖 > 1 is arbitrarily large). Karp’s algorithm was based around partitioning the
                    region into smaller sub regions which are recursively solved. After each sub region is solved the sub tours are
                    then combined together to form a tour through all the cities
                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: '100%',
                    }}>
                        <img src={image1}/>
                    </Box>
                </Typography>

                <Typography variant="body1">
                Sanjeev Arora and Joseph S. B. Mitchell created polynomial time approximation schemes for Euclidean TSP in
1998 and 1999 respectively. Their algorithm not only provides approximate solutions in polynomial time,
but also does so with little modification for all distances measured using geometric norms (such as manhattan
and euclidean distance discussed above).
                </Typography>

                <Typography variant="body1">
                A polynomial time approximation scheme (PTAS) is an algorithm that finds an optimal solutions within a factor of
1 + 1/𝜖 of being optimal where 𝜖 > 0 and can be arbitrarily large. The time complexity of a PTAS can be different
for different 𝜖 but must be linear for each. For example an algorithm running in 𝑂 (𝑛1/𝜖!) time would still be a
PTAS, despite the polynomial increasing drastically as 𝜖 decreases. In 1998 Sanjeev et. al proved that Geometric
TSP doesn’t have a PTAS if 𝑃 ≠ 𝑁 𝑃, note that a PTAS for euclidean TSP doesn’t then necessarily prove 𝑃 = 𝑁 𝑃. In 2010 Arora and Mitchell independently created a PTAS which for every 𝜖 > 0 produces a tour within
(1 + 1/𝜖) factor of the optimal solution in 𝑂 (𝑛(log 𝑛)𝑂 (𝜖 ) ) time in R2. In R𝑑 it runs in 𝑂 (𝑛(log 𝑛) (𝑂 (√𝑑𝑐 )𝑑 −1 ) )
time.
                </Typography>

                <Typography variant="body1">
                Their algorithm behaves in a similar way to Karp’s by recursively partitioning the problem into smaller sub
                problems. The major innovation they provided was by removing the uniform distribution requirement that Karp’s
                solution had. It is worth noting that Arora states their algorithm as currently implemented isn’t practical as "A straightforward implementation (for even moderate values of c) is very slow", but continues that there is no
reason why a more efficient way to implement it
                </Typography>

                <Typography variant="body1">
In 2021 Karlin et. al improved on Christofides polynomial time approximation algorithm by introducing a variant
which reduces the upper error bound from 1.5 to 1.5 − 10−36 in their paper "A (Slightly) Improved Approximation
Algorithm for Metric TSP". The essence of their technique is to select not necessarily the minimum spanning
tree but one that follows a clever distribution. The rest of the algorithm is the same as Christofides’. They proved
that by selected a spanning tree in this way it slightly improves the approximation ratio of the algorithm while
still running in polynomial time.
                </Typography>
            </Box>
        )
    }
}

export default metric_tsp;