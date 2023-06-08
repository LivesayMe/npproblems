import { Typography } from "@mui/material";
import { Box } from "@mui/system";
import img1 from "./content/download.png";
import ReactAudioPlayer from 'react-audio-player';
import React from "react";

let music_gan = {
    "title": "Generating music with Generative Adversarial Networks",
    "categories": [
        "Machine Learning",
        "Music",
        "GAN"
    ],
    id: 2,
    "body": {
        "type": "markdown",
        "content": (
            <Box>
                <Typography variant="h4">
                    Introduction
                </Typography>
                <Typography variant="body1">
                    Generative Adversarial Networks have proven to be very effective at generating images, but not so effective at generating audio. In an image, any given pixel is heavily dependent on nearby values, but this is less true in audio which has significantly more noise. Audio is generally represented as a time series so temporal coherence is also signfiicantly more important than with images. We can represent the audio without using a time series but we still run into the problem that the "sound" at one point can be heavily dependent on "sound" at a different point in the sample.
                    The 2018 paper <a href="https://arxiv.org/abs/1802.04208" style={{display: "inline-block"}}>WaveGAN</a> attempts to synthesize audio in two ways, first by generating spectrograms, the second by trying to generate the raw waveforms. The raw waveform approach ended up being more effective and was able to generate very convincing samples, although only in very short time frames.
                </Typography>
                <Typography variant="h4">
                    The Music Problem
                </Typography>
                <Typography variant="body1">
                    I wanted to approach a specific subproblem in audio synthesis, namely music synthesis. This assumption that all of the data is music makes the problem much simpler because we can rely on already existing techniques to encode the audio as midis.
                    Recent work by Google in their <a href="https://arxiv.org/abs/2301.11325" style={{display: "inline-block"}}>MusicLM</a> paper suggests that Transformer based auto regressive models work extremely well for music generation, so the entire idea of using GANs to generate music may be outdated now.
                </Typography>
                <Typography variant="h4">
                    My approach
                </Typography>
                <Typography variant="body1">
                    The WaveGAN paper proposes several clever techniques to get better audio from the GANs, which clearly work well, but I wanted to focus on a different approach. 
                    How can we encode the data in such a way that even a simple GAN can generate convincing music? 
                    <br/>
                    The first step in trying to get a good encoding is to convert the MIDIs to a more usable format. I do this using a piano roll approach. This is a matrix where each row represents a note and each column represents a time step. 
                    Normally the value in each cell will represent the intensity of the note at that time step, but I decided to use a binary encoding instead. Each column represents 24ms. 
                    <br/>
                    I used a collection of piano midis found at <a href="http://www.piano-midi.de/" style={{display: "inline-block"}}>piano-midi.de</a> collected by Bernd Krueger, for a total of 280 samples. While the number of individual songs is small, they are all quite long so the amount of data is still high. I converted each of the midis to piano rolls.

                    We could just train a GAN directly on these piano rolls, but there is another preprocessing step we can take to make it simpler.
                    <br/>
                    Consider the piano roll of Debussy's Passepied from Suite Bergamasque
                    <br/>
                    <img src={img1} alt="piano roll" style={{
                        width: '200px',
                        height: 'auto',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}/>
                    <br/>
                    {/* <ReactAudioPlayer src="./content/deb_pass.mp3" controls /> */}
                    Theoretically we could just divide the piano roll into chunks and train the GAN to directly generate the piano roll. However, we can apply our prior bias that the piano roll is sparse. 
                    Since the data is so sparse, we can change basis so that we are only representing the non-zero values. I achieved this by training an autoencoder on each column of the piano roll, with a code size of 2. Since the data is so sparse the autoencoder can achieve a 100% accuracy.
                    <br/>
                    {/* Below is the "compressed" piano roll of Debussy's Passepied
                    <br/>
                    {/* <img src={img2} alt="compressed piano roll" style={{
                        width: '200px',
                        height: 'auto',
                        marginLeft: 'auto',
                        marginRight: 'auto',
                    }}/> */}
                    
                    The last bit of preprocessing is splitting the compressed piano rolls into chunk of 16 columns. This is the input to the GAN.

                    <br/>
                    The output of the GAN is then uncompressed to give the final 16 note long piano roll. The final piano roll actually represents a probability map for each note. I implemented a hard cut off, where the note is played if the probability is greater than 0.5.
                    
                    Songs generated by the GAN run into the issue described in the introduction, they locally sound great, but the overall structure of the song is not very good. It will often shift keys throughout the song. One interesting property of the compression is that training is much more stable for larger song lengths.

                    <br/>
                </Typography>
                <Typography variant="h4">
                    Future Work
                </Typography>
                <Typography variant="body1">
                    There are 2 paths that I think could be interesting here. The first is trying out new image transformers. The intuition for them is that they are better at preserving stability across the entire input, since the attention mechanism is by definition global. That might allow it to generate more coherent songs.
                    <br/>
                    The other path is to try to solve the problem of songs being short. One solution is to train an infill CGAN, which would take a part of the song and be tasked with filling in the rest of it.
                    <br/>
                    <a href="https://colab.research.google.com/drive/1U-gCHnD9rwDcAuvW9xbqCyxtbf6X6sRN?usp=sharing" style={{display: "inline-block"}}>Colab Notebook</a>
                </Typography>

            </Box>
        )
    }
}

export default music_gan;