const http = require('http');
const express = require('express');
require('dotenv').config();
const morgan = require('morgan');
const path = require('path');
const rfs = require('rotating-file-stream');
const mongoose = require('mongoose');
const cors = require('cors');
mongoose.connect(process.env.URI, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true,
});

const app = express();
const httpServer = http.createServer(app);

const corsOptions = {
    exposedHeaders: 'x-auth ',
};
app.use(cors(corsOptions));
app.use(express.json());
const port = process.env.PORT;
let accessLogStream = rfs.createStream('access.log', {
    interval: '1d',
    path: path.resolve(__dirname + '/src/log'),
});
app.use(morgan('combined', { stream: accessLogStream }));
app.use('/api', require('./src/routes/index'));

httpServer.listen(port, () => {
    console.log(`server is running on port ${port}`);
});
