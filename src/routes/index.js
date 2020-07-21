const express = require("express");
const router = express.Router();

//auth
router.use("/auth", require("./auth"));

module.exports = router;
