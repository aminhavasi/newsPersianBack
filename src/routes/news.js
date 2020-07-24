const express = require('express');
const router = express.Router();
const persianDate = require('persian-date');

const { newsValidator } = require('./../validator/joi');
const News = require('./../models/news');
persianDate.toLocale('en');
const date = new persianDate().format('YYYY/M/DD');

router.post('/cretae-news', async (req, res) => {
    try {
        const { error } = await newsValidator(req.body);
        if (error) return res.status(400).send(error.detaild[0].message);

        let body = req.body;
        body.date = date;
        let newNews = await new News(body);
        newNews.save().then((news) => {
            res.status(200).send(news);
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/news', async (req, res) => {
    try {
        let news = await News.find({});
        if (news) {
            res.status(200).send(news);
        } else {
            res.status(404).send('nothing to send');
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

router.get('/news/:id', async (req, res) => {
    let id = req.params.id;
    try {
        const oneNews = await News.findById({ _id: id });
        if (!oneNews) {
            res.status(404).send('we cant find one news with this id');
        } else {
            res.status(200).send(oneNews);
        }
    } catch (err) {
        res.status(400).send('something went wrong');
    }
});

router.put('/news/:id', async (req, res) => {
    try {
        let id = req.params.id;
        await News.findByIdAndUpdate(
            { _id: id },
            { $set: req.body },
            { new: true }
        );

        res.status(200).send();
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete('/news/:id', async (req, res) => {
    try {
        await News.findByIdAndRemove({ _id: req.params.id });
        res.status(200).send();
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
