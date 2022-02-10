const express = require("express");
const app = express();
const http = require("http");
const router = require("./router");
var bodyParser = require('body-parser')
var proxy = require('express-http-proxy');

app.use("/api/mock", bodyParser.json(), router);

// PROXYING_SUPPORT
//app.use(proxy('https://www.google.com'));


const port = process.env.PORT || "8080";
app.set("port", port);

const server = http.createServer(app);
server.listen(port);
console.log(`Started application on port ${port}`);


