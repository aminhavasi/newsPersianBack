const express = require("express");
const router = express.Router();
const Joi = require("joi");
const _ = require("lodash");
const persianDate = require("persian-date");
const nodemailer = require("nodemailer");

const User = require("./../models/user");
const SMTPConnection = require("nodemailer/lib/smtp-connection");
persianDate.toLocale("en");
const date = new persianDate().format("YYYY/M/DD");
//---------------------------------------------------------------
const RegisterValidator = (user) => {
    const schema = Joi.object({
        username: Joi.string().min(3).max(255).required(),
        email: Joi.string().email().max(255).required(),
        password: Joi.string().min(8).max(1024).required(),
    });

    return schema.validate(user);
};
const LoginValidator = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().max(255).required(),
        password: Joi.string().min(8).max(1024).required(),
    });

    return schema.validate(user);
};
const RecoveryValidator = (user) => {
    const schema = Joi.object({
        email: Joi.string().email().max(255).required(),
    });

    return schema.validate(user);
};
//---------------------------------------------------------------
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
                user.genAuthToken().then((token) => {
                    res.header("x-auth", token).status(200).send();
                });
            });
        } else {
            res.status(400).send("This email already exists");
        }
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/login", async (req, res) => {
    try {
        const { error } = await LoginValidator(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        const user = await User.findByCredentials(
            req.body.email,
            req.body.password
        );
        const token = await user.genAuthToken();

        res.header("x-auth", token).status(200).send();
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/recovery", async (req, res) => {
    try {
        const { error } = await RecoveryValidator(req.body);
        if (error) return res.status(400).send(error.details[0].message);
        let user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).send("Please send currect eamil");

        const token = await user.genForgetToken();

        //--------------
        let transporter = await nodemailer.createTransport({
            host: "smtp.chmail.ir",
            port: 465,
            secure: true, // use SSL
            auth: {
                user: "testpau@chmail.ir",
                pass: "F1334m1345a1375",
            },
        });

        let mailOptions = {
            from: "testpau@chmail.ir",
            to: "aminhavasi1996@gmail.com",
            subject: "recoveryPassword",
            text: `for reset password please click on below link\n\n  
            http://${req.headers.host}/api/auth/reset/${token}`,
        };

        await transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });
        res.send("ok");

        //----------------
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/reset/:token", async (req, res) => {
    try {
        //expire time not added now.
        let user = await User.findOne({
            forgetToken: req.params.token,
            forgetExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res.status(400).send("Invalid token or emailLink");
        }
        user.password = req.body.password;
        user.save().then(() => {
            res.status(200).send("ok");
        });
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
