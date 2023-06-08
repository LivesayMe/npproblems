import React, { useEffect } from 'react';
import { Box, Button, Grid, MenuItem, Modal, Select, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import Navbar from '../navbar';

function SubsetSum(props) {

    const [values, setValues] = React.useState([]);
    const [target, setTarget] = React.useState(0);

    const [valueCount, setValueCount] = React.useState(3);

    const [selected, setSelected] = React.useState([]);
    const [selectedIndexes, setSelectedIndexes] = React.useState([]);

    const [openWin, setOpenWin] = React.useState(false);

    useEffect(() => {
        reset();
    }, [valueCount]);

    useEffect(() => {
        if (selected.reduce((a, b) => a + b, 0) === target) {
            setOpenWin(true);
        }
    }, [selected]);

    const generateValues = (n, max) => {

        let digits = [];

        for (let i = 0; i < n; i++) {
            digits.push(Math.floor(Math.random() * (max-1)) + 1);
        }

        return digits;
    }
    
    const reset = () => {
        setSelected([]);
        setSelectedIndexes([]);
        
        //Generate new secret
        let digits = generateValues(valueCount, 20);
        setValues(digits);

        //Pick k random digits
        let k = Math.floor(Math.random() * (digits.length-3)) + 3;
        let sum = 0;

        //Randomly permutate 1 to n digits
        //Create array of 1 to n
        let arr = Array.from(Array(valueCount).keys());
        //Shuffle array
        arr.sort(() => Math.random() - 0.5);

        //Pick k random digits
        for (let i = 0; i < k; i++) {
            sum += digits[arr[i]];
        }

        setTarget(sum);
    }


    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column", mt: 0, overflow: "hidden", }}>
            {/* Top Nav bar, primary color */}
            <Navbar/>

            <Modal open={openWin} onClose={() => {setOpenWin(false)}} sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: "100%",
                height: "100%",
            }}>
                <Box sx={{ 
                    display: "flex", 
                    width: "400px",
                    alignItems: "center",  
                    justifyContent: "center", 
                    flexDirection: "column", 
                    mt: 0, 
                    overflow: "hidden", 
                    bgcolor: "white",
                    p: 2,}}>
                    <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
                        You Win!
                    </Typography>
                    <Button variant="contained" onClick={() => {
                        setOpenWin(false);
                        reset();
                    }}>Play Again</Button>
                </Box>
            </Modal>

            {/* Top Control Bar */}
            <ToggleButtonGroup value={valueCount} exclusive onChange={(e, val) => {setValueCount(val)}}>
                <ToggleButton value={5}>5</ToggleButton>
                <ToggleButton value={7}>7</ToggleButton>
                <ToggleButton value={9}>9</ToggleButton>
                <ToggleButton value={11}>11</ToggleButton>
            </ToggleButtonGroup>

            {/* Main Content */}
            <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "row", mt: 0, overflow: "hidden", p:2, gap: 3,}}>
                {/* Display of all values as boxes */}
                <Box sx={{ display: "flex", width: "500px", alignItems: "center", flexDirection: "row", mt: 0, flexWrap: "wrap", gap: "10px", height: "100%"}}>
                    {values.map((value, index) => {
                        if (selectedIndexes.includes(index)) {
                            return null;
                        } else {
                        return (
                            <Box sx={{
                                width: "100px", 
                                height: value * 10 + "px", 
                                bgcolor: "primary.main",
                                cursor: "pointer",
                                borderRadius: "5px",
                                '&:hover': {
                                    bgcolor: "primary.dark",
                                },
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }} 
                            key={value + "," + index} 
                            onClick={() => {
                                //Check if can fit 
                                if (selected.reduce((a, b) => a + b, 0) + value > target) {
                                    return;
                                }
                                let newSelected = [...selected];
                                let newSelectedIndexes = [...selectedIndexes];
                                newSelected.push(value);
                                newSelectedIndexes.push(index);
                                setSelected(newSelected);
                                setSelectedIndexes(newSelectedIndexes);
                            }}>{value}</Box>
                        )}})}
                </Box>

                {/* Display of selected values as boxes stacked on top of each other */}
                <Box sx={{
                    display: "flex",
                    width: "100px",
                    flexDirection: "column",
                    alignItems: "center",
                }}>
                    <Box sx={{ 
                        display: "flex", 
                        width: "100px", 
                        alignItems: "bottom",  
                        justifyContent: "flex-end", 
                        flexDirection: "column",
                        border: "1px solid black", 
                        borderRadius: "5px", 
                        overflow: "wrap",
                        height: (target*10) + "px"}}>
                        {selected.map((value, index) => {
                            return (
                                <Box sx={{
                                    width: "100px", 
                                    height: value * 10 + "px", 
                                    bgcolor: "secondary.main",
                                    cursor: "pointer",
                                    border: "1px solid black",
                                    borderRadius: "5px",
                                    '&:hover': {
                                        bgcolor: "secondary.dark",
                                    },
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                                key={value + "," + index}
                                onClick={() => {
                                    let newSelected = [...selected];
                                    newSelected.splice(newSelected.indexOf(value), 1);
                                    setSelected(newSelected);

                                    let newSelectedIndexes = [...selectedIndexes];
                                    newSelectedIndexes.splice(newSelectedIndexes.indexOf(index), 1);
                                    setSelectedIndexes(newSelectedIndexes);

                                    let values = [...values];
                                    values.push(value);
                                    setValues(values);
                                }}>{value}</Box>
                            )
                        })}
                        
                    </Box>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            {selected.reduce((a, b) => a + b, 0)} / {target}
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}

export default SubsetSum;

