import React from 'react';
import { Box, Typography } from '@mui/material';

function Racing(props) {

    const canvasRef = React.useRef(null);
    const playerRef = React.useRef({
        x: 0,
        y: 0,
        sizeX: 30,
        sizeY: 30,
        speed: 5,
        rotationSpeed: 3,
        velocity: {
            x: 0,
            y: 0
        },
        rotation: 0
    });

    const inputRef = React.useRef({
        up: false,
        down: false,
        left: false,
        right: false
    });

    const dragCoefficent = 0.9;
    
    React.useEffect(() => {
        const canvas = canvasRef.current;
        calculateCanvasSize();

        const context = canvas.getContext('2d');

        // Our first draw
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);

        const renderPlayer = () => {
            context.fillStyle = '#FFFFFF';
            //rotation = 0 is -pi radians, rotation = 180 is pi radians
            // Calculate the rotated points where (x,y) is the center of the rectangle
            const rotatedX = Math.cos((playerRef.current.rotation - 1) * Math.PI / 180) * playerRef.current.sizeX;
            const rotatedY = Math.sin((playerRef.current.rotation - 1) * Math.PI / 180) * playerRef.current.sizeY;
            
            // Offset the rotated points by the center of the rectangle
            const rotatedXOffset = rotatedX;
            const rotatedYOffset = rotatedY;

            // Draw the rotated rectangle
            context.fill(
                new Path2D(`M${playerRef.current.x + rotatedXOffset} ${playerRef.current.y + rotatedYOffset}
                L${playerRef.current.x + rotatedYOffset} ${playerRef.current.y - rotatedXOffset}
                L${playerRef.current.x - rotatedXOffset} ${playerRef.current.y - rotatedYOffset}
                L${playerRef.current.x - rotatedYOffset} ${playerRef.current.y + rotatedXOffset}
                Z`)
            )
            
        }

        const render = () => {
            context.fillStyle = '#000000';
            context.fillRect(0, 0, canvas.width, canvas.height);

            generateNormalTrack(canvas, context);

            // Update player position
            playerRef.current.x += playerRef.current.velocity.x;
            playerRef.current.y += playerRef.current.velocity.y;

            // Apply drag
            playerRef.current.velocity.x *= dragCoefficent;
            playerRef.current.velocity.y *= dragCoefficent;

            // Update rotation
            if (inputRef.current.left) {
                playerRef.current.rotation -= playerRef.current.rotationSpeed;
            } else if (inputRef.current.right) {
                playerRef.current.rotation += playerRef.current.rotationSpeed;
            }
            // Update velocity by first calculating the forward vector from rotation
            const forwardX = Math.cos(playerRef.current.rotation * Math.PI / 180);
            const forwardY = Math.sin(playerRef.current.rotation * Math.PI / 180);

            if (inputRef.current.up) {
                playerRef.current.velocity.x = forwardX * playerRef.current.speed;
                playerRef.current.velocity.y = forwardY * playerRef.current.speed;
            }
            if (inputRef.current.down) {
                playerRef.current.velocity.x = -forwardX * playerRef.current.speed;
                playerRef.current.velocity.y = -forwardY * playerRef.current.speed;
            }

            //Zero out velocity if it's less than 0.5
            if (Math.abs(playerRef.current.velocity.x) < 0.5) {
                playerRef.current.velocity.x = 0;
            }
            if (Math.abs(playerRef.current.velocity.y) < 0.5) {
                playerRef.current.velocity.y = 0;
            }

            // Prevent player from going off screen
            if (playerRef.current.x < 0) {
                playerRef.current.x = 0;
            }
            if (playerRef.current.x > canvas.width - playerRef.current.sizeX) {
                playerRef.current.x = canvas.width - playerRef.current.sizeX;
            }
            if (playerRef.current.y < 0) {
                playerRef.current.y = 0;
            }
            if (playerRef.current.y > canvas.height - playerRef.current.sizeY) {
                playerRef.current.y = canvas.height - playerRef.current.sizeY;
            }


            renderPlayer();
            requestAnimationFrame(render);
        }

        // Listen for keyboard events
        const handleKeyDown = (event) => {
            if(event.key === "w") {
                inputRef.current.up = true;
            }
            if(event.key === "s") {
                inputRef.current.down = true;
            }
            if(event.key === "a") {
                inputRef.current.left = true;
            }
            if(event.key === "d") {
                inputRef.current.right = true;
            }
        }

        const handleKeyUp = (event) => {
            if(event.key === "w") {
                inputRef.current.up = false;
            }
            if(event.key === "s") {
                inputRef.current.down = false;
            }
            if(event.key === "a") {
                inputRef.current.left = false;
            }
            if(event.key === "d") {
                inputRef.current.right = false;
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        // Start the game loop
        render();
        

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        }

    }, []);

    const calculateDrag = (velocity) => {
        return velocity * velocity * dragCoefficent;
    }

    const calculateCanvasSize = () => {
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    //Generates a cylinder track
    const generateNormalTrack = (canvas, context) => {
        // Track has two parallel straight sections of length 1000, and a semi-circle of radius 500 on each side, meaning that each straight section is 1000 apart

        // Genereate the path of the inside of the track
        const insideStartX = 300;
        const insideStartY = 200;
        
        const path = new Path2D();
        path.moveTo(insideStartX, insideStartY);
        path.lineTo(insideStartX+800, insideStartY);
        path.arc(insideStartX+800, insideStartY+250, 250, 3/2*Math.PI, Math.PI/2);
        path.lineTo(insideStartX, insideStartY+500);
        path.arc(insideStartX, insideStartY+250, 250, Math.PI/2, 3/2*Math.PI);
        path.closePath();

        // Generate the path of the outside of the track
        // const path2 = new Path2D();
        // path2.moveTo(insideStartX, insideStartY);
        

        // Fill the track
        context.fillStyle = "green";
        context.fill(path);

        // Fill the outside of the track
        // context.fillStyle = "black";
        // context.fill(path2);

        // Stroke the track
        context.strokeStyle = "black";
        context.stroke(path);
        
        // // Stroke the outside of the track
        // context.strokeStyle = "black";
        // context.stroke(path2);


    }

    return (
        <Box sx={{ display: "flex", flexGrow: 1, width: "100%", alignItems: "center",  justifyContent: "center", flexDirection: "column" }}>
            {/* Top Nav bar, primary color */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 1, m: 0, bgcolor: "primary.main", width: "100%" }}>
                <a href={"/"} style={{textDecoration: "none"}}>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Home
                    </Typography>
                </a>
            </Box>

            {/* Main content */}
            <Box sx={{
                display: "flex",
                flexGrow: 1,
                width: "100%",
                height: "80vh",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
            }}>
                <canvas ref={canvasRef} {...props} style={{
                    height: '100%',
                }}
                
                />
            </Box>
        </Box>
    );
}

export default Racing;