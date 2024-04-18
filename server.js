// Created by Phoenix Staley
// April 17, 2024

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", function (req, res) {
    console.log("Request recieved");
    res.sendFile(__dirname + "/../public/index.html");
})

app.listen(PORT);