const User = require("../models/user");
const UserToken = require("../models/userToken");
const jwtSecrete = process.env.JWT_SECRET;
var jwt = require("jsonwebtoken");
const { sendVerificationEmail } = require("../utils/sendEmail");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password } = req.body;
    const user = new User({ email, username });
    const registeredUser = await User.register(user, password); // User.register() comes from passport

    // Generating email verification token and save it in MongoDB.
    const _userId = registeredUser._id;
    var token = jwt.sign({ email: email }, jwtSecrete);
    const userToken = new UserToken({ _userId, token });
    await userToken.save();

    // Sending out the verification email containing the token we just created.
    let subject = "Resort Review Email Verification";
    let to = email;
    let from = process.env.FROM_EMAIL;
    let link = "http://" + req.headers.host + "/verify/" + token;
    let html = `<p>Hi ${user.username}<p><br><p>Please click on the following <a href="${link}">link</a> to verify your account.</p> 
                <br><p>If you did not request this, please ignore this email.</p>`;
    await sendVerificationEmail({ to, from, subject, html });

    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash(
        "success",
        "Remember to check your inbox! We just sent a verification email."
      );
      res.redirect("/resorts");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = async (req, res) => {
  const { username } = req.body;
  const user = await User.findOne({ username: username });
  if (!user.isVerified) {
    req.flash("error", "Please verify your email to get all features.");
    res.redirect("/resorts");
  } else {
    req.flash("success", "welcome back!");
    const redirectUrl = req.session.returnTo || "/resorts";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
};

module.exports.logout = (req, res, next) => {
  try {
    req.logout(function (err) {
      if (err) return next(err);
      req.flash("success", "Successfully logged out.");
      res.redirect("/resorts");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/resorts");
  }
};

// ===EMAIL VERIFICATION
// @route GET user/verify/:token
// @desc Verify token
module.exports.verify = async (req, res) => {
  if (!req.params.token) {
    req.flash("error", "Couldn't verify your email.");
    res.redirect("login");
    return;
  }

  try {
    // Find a matching token
    const token = await UserToken.findOne({ token: req.params.token });

    if (!token)
      return res.status(400).json({
        message:
          "We were unable to find a valid token. Your token my have expired.",
      });

    // If we found a token, find a matching user
    User.findById(token._userId, (err, user) => {
      if (!user)
        return res
          .status(400)
          .json({ message: "We were unable to find a user for this token." });

      if (user.isVerified)
        return res
          .status(400)
          .json({ message: "This user has already been verified." });

      // Verify and save the user
      user.isVerified = true;
      user.save(function (err) {
        if (err) return res.status(500).json({ message: err.message });

        res.status(200).send("The account has been verified. Please log in.");
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
