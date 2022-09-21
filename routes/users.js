const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const users = require("../controllers/controller_user");
const passport = require("passport");

router.get("/register", users.renderRegister);

router.post("/register", wrapAsync(users.register));

router.get("/login", users.renderLogin);

router.post(
  "/login",
  // a middleware provided by passport
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  users.login
);

router.get("/logout", users.logout);

router.get("/verify/:token", users.verify);

module.exports = router;
