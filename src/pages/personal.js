import { Box, Button, IconButton, Paper, Snackbar, ThemeProvider, Typography, createTheme } from '@mui/material';
import React, { useEffect } from 'react';
import blog1 from "./posts/music_gan";
import blog2 from "./posts/memeories";
import blog3 from "./posts/reverse_clustering";
import blog4 from "./posts/mcts_convergence";
import blog5 from "./posts/metric_tsp"
import { useParams } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {LinkedinIcon, LinkedinShareButton, TwitterIcon, TwitterShareButton} from 'react-share';

const my_theme = createTheme({
    typography: {
        fontFamily: [
            'Roboto',
            'sans-serif',
        ].join(','),
    },

    palette: {
        primary: {
            main: '#D32F2F',
            
        },
        secondary: {
            main: '#009688',
        },
    },
})

function Personal(props) {
    const posts = [blog1, blog2, blog3, blog4, blog5];
    const [filtered, setFiltered] = React.useState(posts);
    const [showLatest, setShowLatest] = React.useState(true);

    //Get the post id from the url
    const {postId} = useParams();

    

    useEffect(() => {
        if (postId && postId !== "latest" && posts.length > 0) {
            setShowLatest(false);
            let f = posts.filter((post) => {
                return post.id.toString() === postId;
            });
            setFiltered(f);
        }
    }, [postId]);

    const getCategories = () => {
        let categories = [];
        let categoryCount = {};
        let temp_posts = [blog1, blog2, blog3, blog4, blog5];
        temp_posts.forEach((post) => {
            categories.push(...post.categories);
            
            for (let i = 0; i < post.categories.length; i++) {
                if (categoryCount[post.categories[i]]) {
                    categoryCount[post.categories[i]] += 1;
                } else {
                    categoryCount[post.categories[i]] = 1;
                }
            }
        });
        return categoryCount;
    }

    const filterPosts = (category) => {
        setShowLatest(false);
        let f = posts.filter((post) => {
            return post.categories.includes(category);
        });
        setFiltered(f);
    }
    
    return (
        <ThemeProvider theme={my_theme}>
            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-around',
                // alignItems: 'center',
            }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    m: 2,
                }}>
                    {showLatest ? 
                    <><Typography variant="h3" sx={{textAlign: "center"}}>
                        Latest
                    </Typography>
                    <Paper 
                    elevation={4}
                    sx={{
                        p: 2,
                    }}>
                        <Blog post={posts.at(-1)} />
                    </Paper>

                    <Typography variant="h3" sx={{mt: 2, textAlign: "center"}}>
                        Older
                    </Typography>
                    {posts.map((post, i) => {
                        if (i === posts.length - 1) {
                            return;
                        }

                        return (
                            <Paper 
                                elevation={4}
                                sx={{
                                    p: 2,
                                    mt: 4,
                                }}>
                                <Blog post={post} />
                            </Paper>
                        );
                    })}
                    </> :
                    <>
                        <Button onClick={() => setShowLatest(true)}>
                            Return To Latest
                        </Button>
                        {filtered.map((post) => {
                            return (
                                <Paper 
                                    elevation={4}
                                    sx={{
                                        p: 2,
                                        mt: 4,
                                    }}>
                                    <Blog post={post} />
                                </Paper>
                            );
                        })}
                    </>}
                </Box>
                
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: "200px",
                }}>
                    <Paper elevation = {3} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mt: 9,
                    }}>
                        <Typography variant="h4">
                            Categories
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: "100%",
                        }}>
                        {Object.entries(getCategories()).map(([category, count]) => {
                            return (
                                <Button onClick={() => filterPosts(category)}>
                                    {category} ({count})
                                </Button>
                            );
                        })}
                        </Box>
                    </Paper>
                    <Box sx={{flex: 1}}/>
                </Box>
            </Box>
        </ThemeProvider>
    );
}

// Structure
// {
//     "title": String
//     "categories": [String]
//     "body": {
//         "type": String (markdown, plaintext)
//         "content": String
//     }
// }
function Blog(props) {
    const post = props.post;
    const [open, setOpen] = React.useState(false);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
        }}>
            <Snackbar open = {open} autoHideDuration = {6000} onClose = {() => setOpen(false)} message="URL Copied to Clipboard"/>
            <Box>
                <Typography variant="h4">
                    {post.title}
                </Typography>
            </Box>

            <Box sx={{
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
            }}>
                <Typography variant="subtitle2">
                    Tags: {post.categories.join(", ")}
                </Typography>

                <Box sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 1,
                }}>
                    <Typography variant="subtitle1">
                        Share
                    </Typography>
                    <LinkedinShareButton url = {"https://www.np-problems.web.app/personal/" + post.id}>
                        <LinkedinIcon size = {32} round = {true}/>
                    </LinkedinShareButton>
                    <TwitterShareButton url = {"https://www.np-problems.web.app/personal/" + post.id}>
                        <TwitterIcon size = {32} round = {true}/>
                    </TwitterShareButton>
                    <IconButton onClick={() => {
                        navigator.clipboard.writeText("https://www.np-problems.web.app/personal/" + post.id);
                        setOpen(true);
                    }}>
                        <ContentCopyIcon />
                    </IconButton>
                </Box>
            </Box>

            <Box>
                {post.body.content}
            </Box>
        </Box>
    );
}

export default Personal;