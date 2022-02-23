const express = require('express');
const app = express();
const http = require('http');
const router = require('./router');
var proxy = require('express-http-proxy');
var cors = require('cors');

app.use(cors());

app.use('CONTEXT_PATH', router);

// PROXYING_SUPPORT
//app.use(proxy('https://www.google.com'));

const port = process.env.PORT || '8080';
app.set('port', port);

const server = http.createServer(app);
server.listen(port);
console.log(`Started application on port ${port}`);
