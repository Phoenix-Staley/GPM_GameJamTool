// Created by Phoenix Staley
// April 17, 2024

const express = require("express");
const expressSession = require("express-session");
const { v4: uuidv4 } = require("uuid");
const userRouter = express.Router();
const gamejamRouter = express.Router();
require("dotenv").config();

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

app.get("/", function (req, res) {
    console.log("/ request recieved");
    res.sendFile(__dirname + "/../public/index.html");
});

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

userRouter.post("/signUp", function (req, res) {
    if (!req.query.username || !req.query.name || !req.query.password_encoded) {
        res.status(400).send("No 'name', 'username', or 'password_encoded' query parameters.");
        console.log("/signUp - 400 - Bad request");
        return;
    }
    
    const user = {
        ...req.query,
        isAdmin: false,
        bio: ""
    };
    const username = user.username;

    for (let i = 0; i < database.users.length; i++) {
        if (database.users[i].username === req.query.username) {
            res.status(400).send("Username taken");
            console.log("/signUp - 400 - Username taken");
            return;
        }
    }

    database.users.push(user);

    req.session.profile = user;
    
    res
     .status(201)
     .send({
        username: username,
        name: user.name,
        isAdmin: user.isAdmin,
        bio: user.bio
    });
    console.log(`/signUp - 201 - ${req.query.username}`);
});

userRouter.get("/getUser", function (req, res) {
    if (!req.query.username) {
        res.status(400).send("No 'username' query parameter");
        console.log("/getUser - 400 - Bad request");
        return;
    }

    for (let i = 0; i < database.users.length; i++) {
        if (database.users[i].username === req.query.username) {
            const user = database.users[i]
            res.status(200).send({
                username: user.username,
                name: user.name,
                isAdmin: user.isAdmin,
                bio: user.bio
            });
            console.log(`/getUser - 200 - ${user.username}`);
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/getUser - 404 - ${req.query.username}`);
});

userRouter.get("/getUsers", function (req, res) {
    if (database.users.length === 0) {
        res.status(404).send([]);
        console.log("/getUsers - 404 - No users");
    } else {
        res.status(200).send(database.gamejams);
        console.log(`/getUsers - 200`);
    }
});

userRouter.put("/updateUser", function (req, res) {
    if (Object.keys(req.query).length < 2 || !req.query?.username) {
        res
         .status(400)
         .send("Not enough query parameters. Check documentation.");
        console.log("/updateUser - 400 - Bad request");
        return;
    }
    
    const username = req.query.username;

    if (!req?.session?.profile || req.session.profile.username !== username) {
        res.status(403).send("Not authorized");
        console.log("/updateUser - 403 - Not authorized");
        return;
    }

    for (let i = 0; i < database.users.length; i++) {
        if (database.users[i].username === req.query.username) {
            let user = database.users[i];

            user.bio = req.query.bio ? req.query.bio : user.bio;
            user.name = req.query.name ? req.query.name : user.name;

            res.status(200).send({
                username: user.username,
                name: user.name,
                isAdmin: user.isAdmin,
                bio: user.bio
            });
            console.log(`/updateUser - 200 - ${user.username}`);
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/updateUser - 404 - ${req.session.profile.username}`);
});

userRouter.delete("/deleteUser", function (req, res) {
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

    for (let i = 0; i < database.users.length; i++) {
        if (database.users[i].username === req.query.username) {
            database.users.splice(i,1);
            res.sendStatus(200);
            console.log(`/deleteUser - 200 - ${user.username}`);
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/updateuser - 404 - ${user.username}`);
});

gamejamRouter.post("/postJam", function (req, res) {
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

    for (let i = 0; i < database.gamejams.length; i++) {
        const jam = database.gamejams[i];
        if (jam.title === req.query.title) {
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

    database.gamejams.push(jam);
    
    res
     .status(201)
     .send(jam);
    console.log(`/postJam - 201 - ${jam.title}`);
});

gamejamRouter.get("/getJam", function (req, res) {
    if (!req.query.title) {
        res.status(400).send("No 'title' query parameter");
        console.log("/getJam - 400 - Bad request");
        return;
    }

    for (let i = 0; i < database.gamejams.length; i++) {
        if (database.gamejams[i].title === req.query.title) {
            res.status(200).send(database.gamejams[i]);
            console.log(`/getJam - 200 - ${database.gamejams[i].title}`);
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/getJam - 404 - ${req.query.title}`);
});

gamejamRouter.get("/getJams", function (req, res) {
    if (database.gamejams.length === 0) {
        res.status(404).send([]);
        console.log("/getJams - 404 - No jams");
    } else {
        res.status(200).send(database.gamejams);
        console.log(`/getJams - 200`);
    }
});

gamejamRouter.put("/updateJam", function (req, res) {
    if (Object.keys(req.query).length < 2 || !req.query?.title) {
        res
         .status(400)
         .send("Not enough query parameters. Check documentation.");
        console.log("/updateJam - 400 - Bad request");
        return;
    }
    
    const title = req.query.title;

    if (!req?.session?.profile || !req.session.profile.isAdmin) {
        res.status(403).send("Not authorized");
        console.log("/updateJam - 403 - Not authorized");
        return;
    }

    for (let i = 0; i < database.gamejams.length; i++) {
        if (database.gamejams[i].title === title) {
            let jam = database.gamejams[i];

            jam.description = req.query.description ? req.query.description : jam.description;
            jam.title = req.query.title ? req.query.title : jam.title;
            jam.date = req.query.date ? req.query.date : jam.date;

            res.status(200).send(jam);
            console.log(`/updateJam - 200 - ${jam.title}`);
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/updateJam - 404 - ${req.query.title}`);
});

gamejamRouter.put("/addOrRemoveParticipant", function (req, res) {
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

    let jam = null;
    let participants = [];
    for (let i = 0; i < database.gamejams.length; i++) {
        if (database.gamejams[i].title === req.query.title) {
            jam = database.gamejams[i];
            participants = database.gamejams[i].participants;
        }
    }

    if (jam === null) {
        console.log("Request to add participant to non-existant game jam received");
        res.status(404).send("Not found");
        console.log(`/addOrRemoveParticipant - 404 - ${req.query.title}`);
        return;
    }

    const newParticipant = req.session.profile.username;
    for (let i = 0; i < participants.length; i++) {
        if (participants[i] === newParticipant) {
            jam.participants.splice(i,1);
            res.status(200).send(jam);
            console.log(`/addOrRemoveParticipant - 200 - Remove ${req.session.profile.username}`);
            return;
        }
    }

    jam.participants.push(newParticipant);
    res.status(200).send(jam);
    console.log(`/addOrRemoveParticipant - 200 - Add ${req.session.profile.username}`);
});

gamejamRouter.delete("/deleteJam", function (req, res) {
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

    for (let i = 0; i < database.gamejams.length; i++) {
        if (database.gamejams[i].title === jam.title) {
            database.gamejams.splice(i,1);
            res.sendStatus(200);
            console.log(`/deletJam - 200 - ${req.query.title}`);
            return;
        }
    }

    res.status(404).send("Not found");
    console.log(`/deletJam - 404 - ${req.query.title}`);
});

app.listen(PORT);