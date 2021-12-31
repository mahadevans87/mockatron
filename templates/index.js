const express = require("express");
const app = express();
const http = require("http");
const router = require("./router");

app.use("/context-path", router);

//app.use(errorHandler());


const port = process.env.PORT || "8080";
app.set("port", port);

const server = http.createServer(app);
server.listen(port);
console.log(`Started application on port ${port}`);


