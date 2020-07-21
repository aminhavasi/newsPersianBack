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
