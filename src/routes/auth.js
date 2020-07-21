const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const persianDate = require("persian-date");
const User = require("./../models/user");
persianDate.toLocale("en");
const date = new persianDate().format("YYYY/M/DD");

const RegisterValidator = (user) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(255).required(),
        email: Joi.string().email().max(255).required(),
        password: Joi.string().min(8).max(1024).required(),
    });

    return schema.validate(user);
};

router.post("/register", async (req, res) => {
    try {
        const { error } = await RegisterValidator(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const body = await _.pick(req.body, ["username", "email", "password"]);
        body.date = date;
        const user = await User.findOne({ email: body.email });
        if (!user) {
            const newUser = await new User(body);
            newUser.save().then((user) => {
                user.genAuthToken();
                res.status(200).send();
            });
        } else {
            res.status(400).send("This email already exists");
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
