const Review = require("../models/review");
const Resort = require("../models/resort");

module.exports.postReview = async (req, res) => {
  const resort = await Resort.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  resort.reviews.push(review);
  await review.save();
  await resort.save();
  req.flash("success", "Created new review.");
  res.redirect(`/resorts/${resort._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await Resort.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted.");
  res.redirect(`/resorts/${id}`);
};
