const Resort = require("./models/resort");
const ExpressError = require("./utils/ExpressError");
const { resortJoiSchema, reviewJoiSchema } = require("./schemas.js");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl; // create a new field called returnTo in session, so that after user logged in they can redirected to their original url.
    req.flash("error", "Please login first.");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateResort = (req, res, next) => {
  const { error } = resortJoiSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const resort = await Resort.findById(id);
  if (!resort.author.equals(req.user._id)) {
    req.flash("error", "No permission");
    return res.redirect(`/resorts/${id}`);
  }
  next();
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewJoiSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "No permission");
    return res.redirect(`/resorts/${id}`);
  }
  next();
};
