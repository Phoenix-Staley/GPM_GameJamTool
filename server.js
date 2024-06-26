// Created by Phoenix Staley
// April 17, 2024

const express = require("express");
const expressSession = require("express-session");
const { v4: uuidv4 } = require("uuid");
const userRouter = express.Router();
const gamejamRouter = express.Router();
const postRouter = express.Router();
const AWS = require("aws-sdk");

require("dotenv").config();
AWS.config.update({
    region: "us-east-1"
});


const DynamoDB = new AWS.DynamoDB();
const app = express();
const PORT = process.env.PORT || 3000;
const database = {
    users: [],
    gamejams: []
}; // Stand in, while the AWS DB is being set up

app.use(express.static("public"));
app.use(expressSession({
    genid: function(req) {
        return uuidv4() // Use unique user IDs for session IDs
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 86400000
    }
}));
app.use(userRouter);
app.use(gamejamRouter);
app.use(postRouter);

app.get("/", function (req, res) {
    console.log("/ request received");
    res.sendFile(__dirname + "/../public/index.html");
});

// User Related Routes
app.get("/makeAdmin", function (req, res) {
    if (!req?.session?.profile?.username) {
        res.sendStatus(403);
        console.log("/makeAdmin - 403 - Not logged in");
        return;
    }

    const username = req.session.profile.username;

    for (let i = 0; i < database.users.length; i++) {
        if (database.users[i].username === username) {
            const user = database.users[i];
            req.session.profile = user;
            database.users[i].isAdmin = true;
            res.sendStatus(200);
            console.log(`/makeAdmin - 200 - ${req.session.profile.username}`);
            return;
        }
    }
});

userRouter.post("/signUp", async function (req, res) {
    if (!req.query.username || !req.query.name || !req.query.password_encoded) {
        res.status(400).send("No 'name', 'username', or 'password_encoded' query parameters.");
        console.log("/signUp - 400 - Bad request");
        return;
    }
    
    const newUser = {
        ...req.query,
        isAdmin: false,
        bio: ""
    };

    let users = [];
    await DynamoDB.scan({
        TableName: "users"
     },
     function (err, data) {
        if (err) {
            console.error("Unable to find users", err);
            res.sendStatus(500);
            return;
        } else {
            users = data.Items;
        }
    }).promise();

    for (let i = 0; i < users.length; i++) {
        if (users[i].username.S === newUser.username) {
            res.status(400).send("Username taken");
            console.log("/signUp - 400 - Username taken");
            return;
        }
    }

    DynamoDB.putItem({
        TableName: "users",
        Item: {
            userID: { S: newUser.username },
            username: { S: newUser.username },
            name: { S: newUser.name },
            bio: { S: newUser.bio },
            password: { S: newUser.password_encoded },
            isAdmin: { BOOL: newUser.isAdmin }
        }
     },
     function (err) {
        if (err) {
            console.error("Unable to add user", err);
        } else {
            req.session.profile = newUser;
    
            res
            .status(201)
            .send({
                username: newUser.username,
                name: newUser.name,
                isAdmin: newUser.isAdmin,
                bio: newUser.bio
            });
            console.log(`/signUp - 201 - ${req.query.username}`);
        }
    });
});

userRouter.post("/signIn", async function (req, res) {
    if (!req.query?.username || !req.query?.password_encoded) {
        res.status(400).send("No 'username' or 'password' query parameters.");
        console.log("/signIn - 400 - Bad request");
        return;
    }

    let user = undefined;
    await DynamoDB.getItem({
        TableName: "users",
        Key: {
            userID: { S: req.query.username }
        }
     }, 
     function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/getUser - 500`);
            console.error(err);
            return;
        } else if (data.Item === undefined) {
            res.status(403).send("Incorrect username or password");
            console.log(`/signIn - 403 - Incorrect username or password`);
            return;
        } else {
            user = data.Item;
        }
    }).promise();

    if (user === undefined) {
        return;
    }

    if (user.password.S === req.query.password_encoded) {
        req.session.profile = {
            username: user.username.S,
            name: user.name.S,
            bio: user.bio.S,
            isAdmin: user.isAdmin.BOOL
        };
        console.log(req.session.profile);
        res.status(200).send(req.session.profile);
        console.log(`/signIn - 200 - ${user.username.S}`);
        return;
    } else {
        res.status(403).send("Incorrect username or password");
        console.log(`/signIn - 403 - Incorrect username or password`);
        return;
    }
});

userRouter.get("/getUser", function (req, res) {
    if (!req.query.username) {
        res.status(400).send("No 'username' query parameter");
        console.log("/getUser - 400 - Bad request");
        return;
    }

    DynamoDB.getItem({
        TableName: "users",
        Key: {
            userID: { S: req.query.username }
        }
     }, 
     function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/getUser - 500`);
            console.error(err);
            return;
        } else {
            if (data.Item === undefined) {
                res.status(404).send("Not found");
            } else {
                const user = data.Item;
                res.status(200).send({
                    username: user.username.S,
                    name: user.name.S,
                    isAdmin: user.isAdmin.BOOL,
                    bio: user.bio.S
                });
                console.log(`/getUser - 200 - ${user.username}`);
            }
        }
    });
});

userRouter.get("/getUsers", async function (req, res) {
    let users = [];
    await DynamoDB.scan({
        TableName: "users"
    }, function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/getUser - 500`);
            console.error(err);
            return;
        } else {
            const rawUsers = data.Items;
            for (let i = 0; i < data.Items.length; i++) {
                const user = rawUsers[i];
                users.push({
                    username: user.username.S,
                    bio: user.bio.S,
                    name: user.name.S,
                    isAdmin: user.isAdmin.BOOL
                });
            }
        }
    }).promise();

    res.status(200).send(users);
    console.log(`/getUsers - 200`);
});

userRouter.put("/updateUser", async function (req, res) {
    if (Object.keys(req.query).length < 2 || !req.query?.username) {
        res
         .status(400)
         .send("Not enough query parameters. Check documentation.");
        console.log("/updateUser - 400 - Bad request");
        return;
    }
    
    const username = req.query.username;

    let users = [];
    await DynamoDB.scan({
        TableName: "users"
     },
     function (err, data) {
        if (err) {
            console.error("Unable to find users", err);
            res.sendStatus(500);
            return;
        } else {
            users = data.Items;
        }
    }).promise();

    if (users.length === 0) {
        return;
    }

    if (!req?.session?.profile) {
        res.status(403).send("Not authorized");
        console.log("/updateUser - 403 - Not authorized");
        return;
    }

    for (let i = 0; i < users.length; i++) {
        if (users[i].username.S === req.query.username) {
            let user = users[i];

            user.bio = req.query.bio ? { S: req.query.bio } : user.bio;
            user.name = req.query.name ? { S: req.query.name } : user.name;

            let isUpdated = false;
            await DynamoDB.putItem({
                TableName: "users",
                Item: user
             },
             function (err) {
                if (err) {
                    res.status(500).send("Unable to update user");
                    console.log("/updateUser - 500");
                    console.error(err);
                    return;
                } else {
                    isUpdated = true;
                }
            }).promise();

            if (!isUpdated) {
                return;
            }

            if (req.session.profile.username !== user.username.S) {
                res.status(403).send("Not authorized");
                console.log("/updateUser - 403 - Not authorized");
                return;
            }

            res.status(200).send({
                username: user.username.S,
                name: user.name.S,
                isAdmin: user.isAdmin.BOOL,
                bio: user.bio.S
            });
            console.log(`/updateUser - 200 - ${user.username}`);
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/updateUser - 404 - ${req.session.profile.username}`);
});

userRouter.delete("/deleteUser", async function (req, res) {
    const user = req.query;

    if (!user || !user.username) {
        res.status(400).send("No 'username' query parameter");
        console.log("/deleteUser - 400 - Bad request");
        return;
    }

    // Reject request if the user isn't logged in,
    //  or they're not authorized to delete this account
    if (!req.session || !req?.session?.profile || (!req.session.profile.isAdmin && req.session.profile.username !== user.username)) {
        res.status(403).send("Not authorized");
        console.log("/deleteUser - 403 - Not authorized");
        return;
    }

    let users = [];
    await DynamoDB.scan({
        TableName: "users"
     },
     function (err, data) {
        if (err) {
            console.error("Unable to find users", err);
            res.sendStatus(500);
            return;
        } else {
            users = data.Items;
        }
    }).promise();

    if (users.length === 0) {
        return;
    }

    for (let i = 0; i < users.length; i++) {
        if (users[i].username.S === req.query.username) {
            const rawUser = users[i];
            DynamoDB.deleteItem({
                TableName: "users",
                Key: {
                    userID: { S: rawUser.username.S }
                }
             },
             function (err) {
                if (err) {
                    console.error("Unable to delete user", err);
                    res.sendStatus(500);
                    return;
                } else {
                    res.sendStatus(200);
                    console.log(`/deleteUser - 200 - ${user.username}`);
                    return;
                }
            });
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/deleteUser - 404 - ${user.username}`);
});

// Game Jam Related Routes
gamejamRouter.post("/postJam", async function (req, res) {
    if (!req.query.title || !req.query.date || !req.query.description) {
        res.status(400).send("No 'title', 'date', or 'description' query parameters.");
        console.log("/postJam - 400 - Bad request");
        return;
    }

    if (!req.session || !req?.session?.profile || !req.session.profile.isAdmin) {
        res.status(403).send("Not authorized");
        console.log("/postJam - 403 - Not authorized");
        return;
    }

    let jams = [];
    await DynamoDB.scan({
        TableName: "gameJams"
    }, function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/postJam - 500`);
            console.error(err);
            return;
        } else {
            jams = data.Items;
        }
    }).promise();

    for (let i = 0; i < jams.length; i++) {
        const jam = jams[i];
        if (jam.title.S === req.query.title) {
            res.status(400).send("Title taken");
            console.log("/postJam - 400 - Title taken");
            return;
        }
    }
    
    const jam = {
        ...req.query,
        participants: [],
        posts: []
    };

    DynamoDB.putItem({
        TableName: "gameJams",
        Item: {
            gameJamID: { S: jam.title },
            title: { S: jam.title },
            description: { S: jam.description },
            date: { S: jam.date },
            participants: { L: [] },
            posts: { L: [] }
        }
     },
     function (err) {
        if (err) {
            console.error("Unable to add user", err);
        } else {
            res
             .status(201)
             .send(jam);
            console.log(`/postJam - 201 - ${jam.title}`);
        }
    });
});

async function populateGameJams(rawJams) {
    let result = [];

    let posts = [];
    await DynamoDB.scan({
        TableName: "posts"
    }, function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/getJam - 500`);
            console.error(err);
            return;
        } else {
            posts = data.Items;
        }
    }).promise();

    for (let i = 0; i < rawJams.length; i++) {
        const rawJam = rawJams[i];
        refinedJam = {
            title: rawJam.title.S,
            description: rawJam.description.S,
            date: rawJam.date.S,
            participants: [],
            posts: []
        }

        for (let i = 0; i < rawJam.posts.L.length; i++) {
            for (let j = 0; j < posts.length; j++) {
                if (posts[j].postID.S === rawJam.posts.L[i].S) {
                    const post = posts[j];
                    refinedJam.posts.push({
                        title: post.title.S,
                        date: post.date.S,
                        content: post.content.S
                    });
                }
            }
        }

        for (let i = 0; i < rawJam.participants.L.length; i++) {
            refinedJam.participants.push(rawJam.participants.L[i].S);
        }

        result.push(refinedJam);
    }

    return result;
}

gamejamRouter.get("/getJam", async function (req, res) {
    if (!req.query.title) {
        res.status(400).send("No 'title' query parameter");
        console.log("/getJam - 400 - Bad request");
        return;
    }

    let jams = [];
    await DynamoDB.scan({
        TableName: "gameJams"
    }, function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/getJam - 500`);
            console.error(err);
            return;
        } else {
            jams = data.Items;
        }
    }).promise();

    let rawJam = {};
    let refinedJam = {};
    for (let i = 0; i < jams.length; i++) {
        if (jams[i].title.S === req.query.title) {
            rawJam = jams[i];
            refinedJam = await populateGameJams([rawJam]);

            res.status(200).send(refinedJam[0]);
            console.log(`/getJam - 200 - ${refinedJam[0].title}`);
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/getJam - 404 - ${req.query.title}`);
});

gamejamRouter.get("/getJams", async function (req, res) {
    let jams = [];
    await DynamoDB.scan({
        TableName: "gameJams"
    }, function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/getJam - 500`);
            console.error(err);
            return;
        } else {
            jams = data.Items;
        }
    }).promise();

    let refinedJams = await populateGameJams(jams);

    res.status(200).send(refinedJams);
    console.log(`/getJams - 200`);
});

gamejamRouter.put("/updateJam", async function (req, res) {
    if (Object.keys(req.query).length < 2 || !req.query?.title) {
        res
         .status(400)
         .send("Not enough query parameters. Check documentation.");
        console.log("/updateJam - 400 - Bad request");
        return;
    }
    
    if (!req?.session?.profile || !req.session.profile.isAdmin) {
        res.status(403).send("Not authorized");
        console.log("/updateJam - 403 - Not authorized");
        return;
    }

    const title = req.query.title;

    let jams = [];
    await DynamoDB.scan({
        TableName: "gameJams"
    }, function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/updateJam - 500`);
            console.error(err);
            return;
        } else {
            jams = data.Items;
        }
    }).promise();

    for (let i = 0; i < jams.length; i++) {
        if (jams[i].title.S === req.query.title) {
            let rawJam = jams[i];
            let jam = {
                gameJamID: rawJam.gameJamID,
                title: req.query.title ? { S: req.query.title } : rawJam.title,
                description: req.query.description ? { S: req.query.description } : rawJam.description,
                date: req.query.date ? { S: req.query.date } : rawJam.date,
                participants: rawJam.participants,
                posts: rawJam.posts
            };

            let isUpdated = false;
            await DynamoDB.putItem({
                TableName: "gameJams",
                Item: jam
             },
             function (err) {
                if (err) {
                    res.status(500).send("Unable to update game jam");
                    console.log("/updateJam - 500");
                    console.error(err);
                    return;
                } else {
                    isUpdated = true;
                }
            }).promise();

            if (!isUpdated) {
                return;
            }

            let populatedJam = (await populateGameJams([rawJam]))[0];
            res.status(200).send(populatedJam);
            console.log(`/updateJam - 200 - ${populatedJam.title}`);
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/updateJam - 404 - ${req.query.title}`);
});

gamejamRouter.put("/addOrRemoveParticipant", async function (req, res) {
    if (!req.query.title) {
        res.status(400).send("No 'title' query parameter");
        console.log("/addOrRemoveParticipant - 400 - Bad request");
        return;
    }

    if (!req?.session?.profile?.username) {
        res.status(401).send("Not logged in");
        console.log("/addOrRemoveParticipant - 400 - Not logged in");
        return;
    }

    let jams = [];
    await DynamoDB.scan({
        TableName: "gameJams"
    }, function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/addOrRemoveParticipant - 500`);
            console.error(err);
            return;
        } else {
            jams = data.Items;
        }
    }).promise();

    let jam = null;
    for (let i = 0; i < jams.length; i++) {
        if (jams[i].title.S === req.query.title) {
            let rawJam = jams[i];
            jam = {
                gameJamID: rawJam.gameJamID,
                title: rawJam.title,
                description: rawJam.description,
                date: rawJam.date,
                participants: rawJam.participants,
                posts: rawJam.posts
            };

            let found = false;
            for (let i = 0; i < jam.participants.L.length; i++) {
                if (jam.participants.L[i].S === req.session.profile.username) {
                    found = true;
                    jam.participants.L.splice(i,1);
                }
            }

            if (!found) {
                jam.participants.L.push({ S: req.session.profile.username });
            }

            let isUpdated = false;
            await DynamoDB.putItem({
                TableName: "gameJams",
                Item: jam
             },
             function (err) {
                if (err) {
                    res.status(500).send("Unable to update game jam");
                    console.log("/addOrRemoveParticipant - 500");
                    console.error(err);
                    return;
                } else {
                    isUpdated = true;
                }
            }).promise();

            if (!isUpdated) {
                return;
            }

            let populatedJam = (await populateGameJams([rawJam]))[0];
            res.status(200).send(populatedJam);
            console.log(`/updateJam - 200 - ${populatedJam.title}`);
            return;
        }
    }

    if (jam === null) {
        res.status(404).send("Not found");
        console.log(`/addOrRemoveParticipant - 404 - ${req.query.title}`);
        return;
    }
});

gamejamRouter.delete("/deleteJam", async function (req, res) {
    const jam = req.query;

    if (!jam || !jam.title) {
        res.status(400).send("No 'title' query parameter");
        console.log("/deletJam - 400 - Bad request");
        return;
    }

    // Reject request if the user isn't logged in,
    //  or they're not authorized to delete game jams
    if (!req?.session?.profile || !req.session.profile.isAdmin) {
        res.status(403).send("Not authorized");
        console.log("/deletJam - 403 - Not authorized");
        return;
    }

    let jams = [];
    await DynamoDB.scan({
        TableName: "gameJams"
     },
     function (err, data) {
        if (err) {
            console.error("Unable to find game jams", err);
            res.sendStatus(500);
            return;
        } else {
            jams = data.Items;
        }
    }).promise();

    if (jams.length === 0) {
        return;
    }

    for (let i = 0; i < jams.length; i++) {
        if (jams[i].title.S === req.query.title) {
            const rawJam = jams[i];
            DynamoDB.deleteItem({
                TableName: "gameJams",
                Key: {
                    gameJamID: rawJam.gameJamID
                }
             },
             function (err) {
                if (err) {
                    console.error("Unable to delete game jam", err);
                    res.sendStatus(500);
                    return;
                } else {
                    res.sendStatus(200);
                    console.log(`/deleteJam - 200 - ${rawJam.title.S}`);
                    return;
                }
            });
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/deletJam - 404 - ${req.query.title}`);
});

postRouter.post("/makePost", async function (req, res) {
    if (!req.query?.title || !req.query.content || !req.query.jam_title) {
        res.status(400).send("No 'title', 'content', or 'jam_title' query parameters.");
        console.log("/makePost - 400 - Bad request");
        return;
    }
    
    const date = new Date();
    const newPost = {
        ...req.query,
        comments: [],
        date: date.toJSON().slice(0,10)
    };

    let jams = [];
    await DynamoDB.scan({
        TableName: "gameJams"
     },
     function (err, data) {
        if (err) {
            console.error("Unable to find game jams", err);
            res.sendStatus(500);
            return;
        } else {
            jams = data.Items;
        }
    }).promise();

    let parentJam = null;
    for (let i = 0; i < jams.length; i++) {
        if (jams[i].title.S === newPost.jam_title) {
            parentJam = jams[i];
        }
    }

    if (parentJam === null) {
        res.status(404).send("Game jam not found");
        console.log(`/makePost - 4 - ${newPost.jam_title}`);
        return;
    }

    let posts = [];
    await DynamoDB.scan({
        TableName: "posts"
     },
     function (err, data) {
        if (err) {
            console.error("Unable to access posts", err);
            res.sendStatus(500);
            return;
        } else {
            posts = data.Items;
        }
    }).promise();

    for (let i = 0; i < posts.length; i++) {
        if (posts[i].title.S === newPost.title && posts[i].jam_title.S === newPost.jam_title) {
            res.status(400).send("Title taken");
            console.log ("/makePost - 400 - Title taken");
            return;
        }
    }

    DynamoDB.putItem({
        TableName: "posts",
        Item: {
            postID: { S: newPost.title + " - " + newPost.jam_title },
            title: { S: newPost.title },
            content: { S: newPost.content },
            date: { S: newPost.date },
            comments: { L: [] }
        }
     },
     async function (err) {
        if (err) {
            console.error("Unable to add post", err);
        } else {
            parentJam.posts.L.push({ S: newPost.title + " - " + newPost.jam_title });

            let isUpdated = false;
            await DynamoDB.putItem({
                TableName: "gameJams",
                Item: parentJam
             },
             function (err) {
                if (err) {
                    res.status(500).send("Unable to update game jam");
                    console.log("/updateJam - 500");
                    console.error(err);
                    return;
                } else {
                    isUpdated = true;
                }
            }).promise();

            if (!isUpdated) {
                return;
            }

            res
             .status(201)
             .send(newPost);
            console.log(`/makePost - 201 - ${newPost.title}`);
        }
    });
});

postRouter.get("/getPost", async function (req, res) {
    if (!req.query?.title || !req.query.jam_title) {
        res.status(400).send("No 'title' or 'jam_title' query parameter");
        console.log("/getJam - 400 - Bad request");
        return;
    }

    let jams = [];
    await DynamoDB.scan({
        TableName: "gameJams"
    }, function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/getPost - 500`);
            console.error(err);
            return;
        } else {
            jams = data.Items;
        }
    }).promise();

    let rawJam = null;
    let refinedJam = null;
    for (let i = 0; i < jams.length; i++) {
        if (jams[i].title.S === req.query.jam_title) {
            rawJam = jams[i];
            refinedJam = (await populateGameJams([rawJam]))[0];
        }
    }

    if (rawJam === null) {
        res.status(404).send("Not found");
        console.log(`/getPost - 404 - ${req.query.jam_title}`);
        return;
    }

    for (let i = 0; i < refinedJam.posts.length; i++) {
        let post = refinedJam.posts[i];
        if (post.title === req.query.title) {
            res.status(200).send(post);
            console.log(`/getPost - 200 - ${req.query.jam_title} - ${req.query.title}`);
            return;
        }
    }
});

postRouter.get("/getPosts", async function (req, res) {
    if (!req.query?.jam_title) {
        res.status(400).send("No 'title' or 'jam_title' query parameter");
        console.log("/getJam - 400 - Bad request");
        return;
    }

    let refinedPosts = [];
    let posts = null;
    await DynamoDB.scan({
        TableName: "posts"
    }, function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/getPost - 500`);
            console.error(err);
            return;
        } else {
            posts = data.Items;
        }
    }).promise();

    if (posts === null) {
        return;
    }

    for (let i = 0; i < posts.length; i++) {
        let post = posts[i];
        if (post.postID.S === (post.title.S + " - " + req.query.jam_title)) {
            refinedPosts.push({
                title: post.title.S,
                date: post.date.S,
                content: post.content.S,
                comments: []
            });
            for (let j = 0; j < post.comments.L.length; j++) {
                let comment = post.comments.L[j].M;
                refinedPosts[-1].comments.push({
                    poster: comment.poster,
                    content: comment.content
                });
            }
        }
    }

    res.status(200).send(refinedPosts);
});

postRouter.delete("/deletePost", async function (req, res) {
    if (!req.query?.title || !req.query.jam_title) {
        res.status(400).send("No 'title' or 'jam_title' query parameter");
        console.log("/deletPost - 400 - Bad request");
        return;
    }

    // Reject request if the user isn't logged in,
    //  or they're not authorized to delete game jams
    if (!req?.session?.profile || !req.session.profile.isAdmin) {
        res.status(403).send("Not authorized");
        console.log("/deletPost - 403 - Not authorized");
        return;
    }

    let posts = [];
    await DynamoDB.scan({
        TableName: "posts"
     },
     function (err, data) {
        if (err) {
            console.error("Unable to find game jams", err);
            res.sendStatus(500);
            return;
        } else {
            posts = data.Items;
        }
    }).promise();

    for (let i = 0; i < posts.length; i++) {
        if (posts[i].title.S === req.query.title) {
            const rawPost = posts[i];
            await DynamoDB.deleteItem({
                TableName: "posts",
                Key: {
                    postID: rawPost.postID
                }
             },
             function (err) {
                if (err) {
                    console.error("Unable to delete game jam", err);
                    res.sendStatus(500);
                    return;
                } else {
                    return;
                }
            }).promise();
        }
    }

    let jams = [];
    let jam = null;
    await DynamoDB.scan({
        TableName: "gameJams"
    }, function (err, data) {
        if (err) {
            res.sendStatus(500);
            console.log(`/getJam - 500`);
            console.error(err);
            return;
        } else {
            jams = data.Items;
        }
    }).promise();
    
    for (let i = 0; i < jams.length; i++) {
        if (jams[i].title.S === req.query.jam_title) {
            for (let j = 0; j < jams[i].posts.L.length; j++) {
                if (jams[i].posts.L[j].title === req.query.title) {
                    jams[i].posts.L.splice(i,1);
                }
            }
            jam = jams[i];
        }
    }
    
    if (jam === null) {
        return;
    }

    DynamoDB.putItem({
        TableName: "gameJams",
        Item: jam
     },
     function (err) {
        if (err) {
            res.status(500).send("Unable to update game jam");
            console.log("/updateJam - 500");
            console.error(err);
            return;
        } else {
            res.sendStatus(200);
            console.log(`/deletePost - 200 - ${req.query.title}`);
            return;
        }
    });
});

// Comment routes
let commentCounter = 0; //for commentID

postRouter.post("/makeComment", async function (req, res) {
    if (!req.query?.jam_title || !req.query?.post_title || !req.query?.comment_title || !req.query?.comment_body) {
        res.status(400).send("Required query parameters are missing.");
        console.log("/makeComment - 400 - Bad request");
        return;
    }

    const newComment = {
        commentID: "${req.query.post_title} - ${++commentCounter}",
        body: req.query.body,
        poster: req.session?.profile?.username
    };

    DynamoDB.updateItem({
        TableName: "posts",
        Key: {
            postID: { S: req.query.postID }
        },
        UpdateExpression: "SET comments = list_append(comments, :comments)",
        ExpressionAttributeValue: {
            ":comments": { L: [{ M: newComment }] }
        }
    },
    function (err) {
        console.log("After updateItem");
        if (err) {
            console.error("Unable to add comment", err);
        } else {
            res
            .status(201)
            .send(newComment);
            console.log("/makePost - 201 - ${newComment.commentID");
        }
    });
});

app.listen(PORT);