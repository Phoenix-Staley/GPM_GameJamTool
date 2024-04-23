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

userRouter.post("/signUp", function (req, res) {
    if (!req.query.username || !req.query.name || !req.query.password_encoded) {
        res.status(400).send("No 'name', 'username', or 'password_encoded' query parameters.");
        return;
    }
    
    const user = {
        ...req.query,
        isAdmin: false,
        bio: ""
    };
    const username = user.username;
    
    console.log(`Request to sign up ${username} recieved`);

    for (let i = 0; i < database.users.length; i++) {
        if (database.users[i].username === req.query.username) {
            res.status(400).send("Username taken");
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
});

userRouter.get("/getUser", function (req, res) {
    if (!req.query.username) {
        res.status(400).send("No 'username' query parameter");
        return;
    }
    
    let found = false;

    console.log(`Request for ${req.query.username} recieved`);

    for (let i = 0; i < database.users.length; i++) {
        if (database.users[i].username === req.query.username) {
            found = true;
            const user = database.users[i]
            res.status(200).send({
                username: user.username,
                name: user.name,
                isAdmin: user.isAdmin,
                bio: user.bio
            });
            break;
        }
    }

    if (!found) {
        console.log("404 error");
        res.status(404).send("Not found");
    }
});

userRouter.put("/updateUser", function (req, res) {
    if (Object.keys(req.query).length < 2) {
        res
         .status(400)
         .send("Not enough query parameters. Check documentation.");
        return;
    }
    
    const username = req.query.username;

    if (!req?.session?.profile || req.session.profile.username !== username) {
        res.status(403).send("Not authorized");
        return;
    }

    console.log(`Update request for ${username} recieved`);

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
            return;
        }
    }

    res.status(404).send("Not found");
});

userRouter.delete("/deleteUser", function (req, res) {
    const user = req.query;

    if (!user || !user.username) {
        res.status(400).send("No 'username' query parameter");
        return;
    }

    // Reject request if the user isn't logged in,
    //  or they're not authorized to delete this account
    if (!req.session || !req?.session?.profile || (!req.session.profile.isAdmin && req.session.profile.username !== user.username)) {
        res.status(403).send("Not authorized");
        return;
    }

    console.log(`Deletion request for ${user.username} recieved`);

    for (let i = 0; i < database.users.length; i++) {
        if (database.users[i].username === req.query.username) {
            database.users.splice(i,1);
            res.sendStatus(200);
            return;
        }
    }

    res.status(404).send("Not found");
});

gamejamRouter.post("/postJam", function (req, res) {
    if (!req.query.title || !req.query.date || !req.query.description) {
        res.status(400).send("No 'title', 'date', or 'description' query parameters.");
        return;
    }

    if (!req.session || !req?.session?.profile || !req.session.profile.isAdmin) {
        res.status(403).send("Not authorized");
        return;
    }

    for (let i = 0; i < database.gamejams.length; i++) {
        const jam = database.gamejams[i];
        if (jam.title === req.query.title) {
            res.status(400).send("Title taken");
            return;
        }
    }
    
    const jam = {
        ...req.query,
        participants: [],
        posts: []
    };
    
    console.log(`Request to create game jam '${jam.title}' recieved`);

    database.gamejams.push(jam);
    
    res
     .status(201)
     .send(jam);
});

gamejamRouter.get("/getJam", function (req, res) {
    if (!req.query.title) {
        res.status(400).send("No 'title' query parameter");
        return;
    }
    
    let found = false;

    console.log(`Request for game jam '${req.query.title}' recieved`);

    console.log(database.gamejams);
    for (let i = 0; i < database.gamejams.length; i++) {
        console.log(database.gamejams[i]);
        if (database.gamejams[i].title === req.query.title) {
            found = true;
            res.status(200).send(database.gamejams[i]);
            return;
        }
    }

    if (!found) {
        console.log("404 error");
        res.status(404).send("Not found");
    }
});

gamejamRouter.put("/updateJam", function (req, res) {
    if (Object.keys(req.query).length < 2) {
        res
         .status(400)
         .send("Not enough query parameters. Check documentation.");
        return;
    }
    
    const title = req.query.title;

    if (!req?.session?.profile || !req.session.profile.isAdmin) {
        res.status(403).send("Not authorized");
        return;
    }

    console.log(`Update game jam request for ${title} recieved`);

    for (let i = 0; i < database.gamejams.length; i++) {
        if (database.gamejams[i].title === title) {
            let jam = database.gamejams[i];

            jam.description = req.query.description ? req.query.description : jam.description;
            jam.title = req.query.title ? req.query.title : jam.title;
            jam.date = req.query.date ? req.query.date : jam.date;

            res.status(200).send(jam);
            return;
        }
    }

    res.status(404).send("Not found");
});

app.listen(PORT);