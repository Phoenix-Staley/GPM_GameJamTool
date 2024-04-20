// Created by Phoenix Staley
// April 17, 2024

const express = require("express");
const expressSession = require("express-session");
const { v4: uuidv4 } = require("uuid");
const userRouter = express.Router();
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;
const database = [] // Stand in, while the AWS DB is being set up

app.use(express.static("public"));
app.use(expressSession({
    genid: function(req) {
        return uuidv4() // Use unique user IDs for session IDs
    },
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
}));
app.use(userRouter);

app.get("/", function (req, res) {
    console.log("Request recieved");
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

    for (let i = 0; i < database.length; i++) {
        if (database[i].username === req.query.username) {
            res.status(400).send("Username taken");
            return;
        }
    }

    database.push(user);
    
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

    for (let i = 0; i < database.length; i++) {
        if (database[i].username === req.query.username) {
            found = true;
            const user = database[i]
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

    for (let i = 0; i < database.length; i++) {
        if (database[i].username === req.query.username) {
            let user = database[i];

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

    for (let i = 0; i < database.length; i++) {
        if (database[i].username === req.query.username) {
            database.splice(i,1);
            res.sendStatus(200);
            return;
        }
    }

    res.status(404).send("Not found");
});

app.listen(PORT);