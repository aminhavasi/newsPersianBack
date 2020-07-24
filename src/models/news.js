const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    date: {
        type: String,
    },
    author: {
        type: String,
    },
    cat: {
        type: String,
    },
    media: {
        type: String,
    },
    content: {
        type: String,
    },
});

const News = mongoose.model('News', newsSchema);

module.exports = News;
