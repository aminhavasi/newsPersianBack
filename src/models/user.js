const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            minlength: 3,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            minlength: 8,
            required: true,
        },
        date: {
            type: String,
        },
        tokens: [
            {
                _id: false,
                access: {
                    type: String,
                    default: "user",
                },

                token: {
                    type: String,
                    required: true,
                },
            },
        ],
        forgetToken: {
            type: String,
        },
        forgetExpire: {
            type: String,
        },
    },
    { timestamps: true }
);

userSchema.methods.genAuthToken = function () {
    let user = this;
    let token = jwt
        .sign(
            {
                _id: user._id.toHexString(),
                access: user.tokens.access,
            },
            process.env.JWT_KEY
        )
        .toString();
    user.tokens.push({ token });
    return user.save().then(() => {
        return token;
    });
};

userSchema.methods.genForgetToken = function () {
    let user = this;
    let token = jwt
        .sign(
            {
                _id: user._id.toHexString(),
            },
            process.env.JWT_KEY
        )
        .toString();
    user.forgetToken = token;
    user.forgetExpire = Date.now() * 3600000;
    return user.save().then(() => {
        return token;
    });
};

userSchema.statics.findByCredentials = function (email, password) {
    let User = this;
    return User.findOne({ email }).then((user) => {
        if (!user) {
            return null;
        }
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) {
                    resolve(user);
                } else {
                    reject();
                }
            });
        });
    });
};
userSchema.pre("save", function (next) {
    let user = this;
    if (user.isModified("password")) {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash;
                next();
            });
        });
    } else {
        next();
    }
});

const User = mongoose.model("User", userSchema);

module.exports = User;
