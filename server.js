// Created by Phoenix Staley
// April 17, 2024

const express = require("express");
const expressSession = require("express-session")
const app = express();
const PORT = process.env.PORT || 3000;
const database = [] // Stand in, while the AWS DB is being set up

app.use(express.static("public"));

app.get("/", function (req, res) {
    console.log("Request recieved");
    res.sendFile(__dirname + "/../public/index.html");
});

app.get("/getUser", function (req, res) {
    let found = false;

    console.log(`Request for ${req.query.username} recieved`);

    for (let i = 0; i < database.length; i++) {
        if (database[i].username === req.query.username) {
            found = true;
            const user = database[i]
            res.status(200).send({
                username: user.username,
                name: user.name,
                isAdmin: user.isAdmin
            });
        }
    }

    if (!found) {
        console.log("404 error");
        res.status(404).send("Not found");
    }
});

app.post("/signUp", function (req, res) {
    const user = {
        ...req.query,
        isAdmin: false
    };
    const username = user.username;

    console.log(`Request to sign up ${username} recieved`);
    database.push(user);
    
    res.status(201).send({
        username: username,
        name: user.name,
        isAdmin: user.isAdmin
    });
});

app.listen(PORT);