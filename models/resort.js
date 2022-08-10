const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String,
});

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

// By default, Mongoose does not include virtuals when you convert a document to JSON.
// So need to set this schema option.
const opts = { toJSON: { virtuals: true } };

const ResortSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    peakElevation: Number,
    baseElevation: Number,
    verticalDrop: Number,
    skiableAcreage: Number,
    totalTrails: Number,
    totalLifts: Number,
    avgAnnualSnowFall: Number,
    location: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);

// prepare the link for the resort when creating the virtual property
ResortSchema.virtual("properties.popUpMarkup").get(function () {
  return `
    <strong><a href="/resorts/${this._id}">${this.title}</a><strong>
    <p>${this.location.substring(0, 20)}...</p>`;
});

// findOneAndDelete is a Mongoose Post middleware. After we deleted the resort, we also delete the associated reviews.
ResortSchema.post("findOneAndDelete", async function (doc) {
  // doc is the deleted resort containing the review ids that will be passed to
  // async function after the deletion, so that we can delete reviews.
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Resort", ResortSchema);
