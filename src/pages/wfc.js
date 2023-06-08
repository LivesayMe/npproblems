import React, { useEffect, useState } from 'react'
import Navbar from '../navbar';
import { Box, Button, Typography, useMediaQuery } from '@mui/material';

export default function WaveCollapse() {

    const [grid, setGrid] = useState([])
    const [tiles, setTiles] = useState([])

    useEffect(() => {
        const possibleTiles = ([
            [0,0,0,
             1,1,1,
             0,1,0],
            [0,0,0,
            1,1,1,
            0,0,0],
            [0,1,0,
            0,1,0,
            0,1,0],
            [0,1,0,
            1,1,0,
            0,1,0],
            [0,1,0,
            0,1,1,
            0,0,0],
            [0,0,0,
            0,1,1,
            0,1,0],
        ])
        setTiles(possibleTiles)
    }, [])

    useEffect(() => {
        generateGrid(5);
    }, [tiles]);

    const generateGrid = (gridSize) => {
        

        const newGrid = [];
        for (let x = 0; x < gridSize; x++) {
            for (let y = 0; y < gridSize; y++) {
                newGrid.push(tiles);
            }
        }

        setGrid(newGrid);
    }

    const collapseTile = (index, force, gridRef, updateState) => {
        let newGrid = gridRef ? gridRef : [...grid];


        const gridSize = 5;
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        const neighbors = [
            [x, y-1],
            [x-1, y],
            [x+1, y],
            [x, y+1],
        ]

        if (force) {
            if(newGrid[index].length <= 1) return newGrid;

            const tileCount = newGrid[index].length;
            const randomTile = Math.floor(Math.random() * tileCount);
            const newTile = newGrid[index][randomTile];
            newGrid[index] = [newTile]

            //Collapse neighbors
            for (let i = 0; i < 4; i++) {
                const curPos = neighbors[i];
                if (curPos[0] >= 0 && curPos[0] < gridSize && curPos[1] >= 0 && curPos[1] < gridSize) {
                    const curNeighbor = newGrid[curPos[1] * gridSize + curPos[0]];
                    if (curNeighbor.length > 1) {
                        newGrid = collapseTile(curPos[1] * gridSize + curPos[0], false, newGrid);
                    }
                }
            }
            if(updateState) {
                setGrid(newGrid)
            }
            return newGrid;
        } else {
            let filteredTiles = newGrid[index];
            const startCount = filteredTiles.length;
            for (let i = 0; i < 4; i++) {
                const curPos = neighbors[i];
                if (curPos[0] >= 0 && curPos[0] < gridSize && curPos[1] >= 0 && curPos[1] < gridSize) {
                    const curNeighbor = newGrid[curPos[1] * gridSize + curPos[0]];
                    //Check if the neighbor has been collapsed    
                    if (curNeighbor.length === 1) {
                        //Filter current tile's possible tiles to only include compatible tiles
                        // i.e. if the collapsed neighbors have the same color on their shared edge
                        const neighborTile = curNeighbor[0];
                        filteredTiles = filteredTiles.filter((tile) => {
                            return tile[(i+1)*2 - 1] === neighborTile[8-(i+1)*2 + 1]
                        })
                    }
                }
            }
            newGrid[index] = filteredTiles;
            //If the tile has been collapsed, collapse neighbors
            if (filteredTiles.length === 1 && startCount > 1) {
                for (let i = 0; i < 4; i++) {
                    const curPos = neighbors[i];
                    if (curPos[0] >= 0 && curPos[0] < gridSize && curPos[1] >= 0 && curPos[1] < gridSize) {
                        const curNeighbor = newGrid[curPos[1] * gridSize + curPos[0]];
                        if (curNeighbor.length > 1) {
                            newGrid = collapseTile(curPos[1] * gridSize + curPos[0], false, newGrid);
                        }
                    }
                }
            }
            return newGrid;
        }
    }

    const generateRandomTiles = (count) => {
        let newTiles = [];
        for (let i = 0; i < count; i++) {
            const newTile = [0,0,0,0,1,0,0,0,0];
            //For each of the 4 sides of the tile, randomly choose if it is a wall or not
            for (let j = 0; j < 4; j++) {
                const random = Math.random();
                if (random > 0.5) {
                    newTile[j*2 + 1] = 1;
                }
            }
            newTiles.push(newTile);
        }
        setTiles(newTiles);
    }

    const collapseAll = () => {
        let curGrid = [...grid];
        let hasUncollapsed = true;
        let loopCount = 0;
        //If there are any tiles with more than one possible tile, collapse them
        while (hasUncollapsed) {
            loopCount++;
            if (loopCount > 100) {
                console.log("Error: loopCount > 100")
                return;
            }
            let availableTiles = curGrid.filter((tile) => {
                return tile.length > 1;
            });
            if (availableTiles.length === 0) {
                hasUncollapsed = false;
            } else {
                //Pick the tile with the least possible tiles
                let minCount = 100000000;
                let minIndex = -1;
                for (let i = 0; i < curGrid.length; i++) {
                    if (curGrid[i].length > 1 && curGrid[i].length < minCount) {
                        minCount = curGrid[i].length;
                        minIndex = i;
                    }
                }

                if (minIndex === -1) {
                    console.log("Error: minIndex is -1")
                    return;
                }

                //Collapse the tile
                curGrid = collapseTile(minIndex, true, curGrid, false);
            }
        }
        setGrid(curGrid);
    }

    const renderTile = (tile, size) => {

        const innerSize = size ? (size / 3) - 2 : 15;

        // 3x3 grid, 0 = empty, 1 = filled (primary)
        return (
            <Box sx={{
                width: size ? size : "50px",
                height: size ? size : "50px",
                border: "1px solid black",
            }}>
                {[0,1,2].map((row) => {
                    return (
                        <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                        }}>
                            {[0,1,2].map((col) => {
                                const index = row * 3 + col;
                                const color = tile[index] === 0 ? "white" : "primary.main";
                                return (
                                    <Box sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: innerSize,
                                        height: innerSize,
                                        bgcolor: color,
                                        borderRadius: "3px",
                                        boxShadow: "0px 0px 2px 0px rgba(0,0,0,0.75)",
                                    }}>
                                    </Box>
                                )
                            })}
                        </Box>
                    )
                })}
            </Box>
        );


    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            <Navbar/>
            {/* Grid display 5x5 */}

            {grid.length == 25 &&
            <Box sx={{
                mt: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
            }}>
                {[0,1,2,3,4].map((row) => {
                    return (
                        <Box sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "center",
                            alignItems: "center",
                            width: "100%",
                        }}>
                            {[0,1,2,3,4].map((col) => {
                                const index = row * 5 + col;
                                return (
                                    <Box sx={{
                                        display: "flex",
                                        flexDirection: "row",
                                        justifyContent: "center",
                                        alignItems: "center",
                                        width: {xs: "65px", sm: "100px", md: "100px", lg: "150px"},
                                        height: {xs: "65px", sm: "100px", md: "100px", lg: "150px"},
                                        boxShadow: 1,
                                        // m: 1,
                                        flexWrap: "wrap",
                                        // gap: "5px",
                                        '&:hover': {
                                            cursor: "pointer",
                                            boxShadow: 5,
                                        },
                                    }} onClick = {() => {
                                        collapseTile(index, true, null, true);
                                    }}>
                                        {grid[index].map((tile) => {
                                            //Base tile size depends on screen size
                                            const tileSizes = {xs: 65, sm: 100, md: 100, lg: 150};
                                            //Calculate base tile size based on screen size (can't use useMediaQuery, useWindowSize, or useTheme because this is inside a callback)
                                            const screenWidth = window.innerWidth;
                                            const screenSize = screenWidth < 600 ? "xs" : screenWidth < 960 ? "sm" : screenWidth < 1280 ? "md" : "lg";
                                            const baseTileSize = tileSizes[screenSize];

                                            
                                            return renderTile(tile, baseTileSize/grid[index].length)
                                        })}
                                    </Box>
                                )
                            })}
                        </Box>
                    )
                })}
            </Box>}
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "10px", mt: 5 }}>
                <Button variant="contained" onClick={() => {
                    generateGrid(5)
                }}>Reset</Button>
                <Button variant="contained" onClick={() => {
                    collapseAll()
                }}>Auto Collapse</Button>
            </Box>
            
            <Typography variant="h6" sx={{ mt: 5 }}>Possible Tiles</Typography>
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "10px", mt: 5, flexWrap: "wrap" }}>
                {tiles.map((tile) => {
                    //Base tile size depends on screen size
                    const tileSizes = {xs: 65, sm: 100, md: 100, lg: 150};
                    //Calculate base tile size based on screen size (can't use useMediaQuery, useWindowSize, or useTheme because this is inside a callback)
                    const screenWidth = window.innerWidth;
                    const screenSize = screenWidth < 600 ? "xs" : screenWidth < 960 ? "sm" : screenWidth < 1280 ? "md" : "lg";
                    const baseTileSize = tileSizes[screenSize];

                    return (<Box sx={{
                        '&:hover': {
                            cursor: "pointer",
                            boxShadow: 5,
                        },
                    }} onClick={() => {
                        //Remove the tile from the list of tiles
                        const newTiles = [...tiles];
                        const index = newTiles.indexOf(tile);
                        newTiles.splice(index, 1);
                        setTiles(newTiles);
                    }}>
                            {renderTile(tile, baseTileSize)}
                        </Box>)
                })}
            </Box>
            
            <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", gap: "10px", mt: 5, mb: 5, }}>
                <Button variant="contained" onClick={() => {
                    generateRandomTiles(5)
                }}>Generate Random Tiles</Button>

                <Button variant="contained" onClick={() => {
                    const newTiles = [...tiles];
                    const newTile = [0,0,0,0,1,0,0,0,0];
                    for (let i = 0; i < 4; i++) {
                        const random = Math.random();
                        if (random > 0.5) {
                            newTile[i*2+1] = 1;
                        }
                    }
                    newTiles.push(newTile);
                    setTiles(newTiles);
                }}>Add Random Tile</Button>
            </Box>
            
        </Box>
    )
}
