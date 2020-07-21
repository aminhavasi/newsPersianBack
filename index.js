const http = require("http");
const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const path = require("path");
const rfs = require("rotating-file-stream");

const app = express();
const httpServer = http.createServer(app);
const port = process.env.PORT;
let accessLogStream = rfs.createStream("requests.log", {
    interval: "1d",
    path: path.resolve(__dirname + "/src/log"),
});
app.use(morgan("combined", { stream: accessLogStream }));

app.get("/", (req, res) => {
    res.send("amin");
});

httpServer.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
