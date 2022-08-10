const Resort = require("../models/resort");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

module.exports.index = async (req, res) => {
  const resorts = await Resort.find({});
  res.render("resorts/index", { resorts });
};

module.exports.renderNewForm = (req, res) => {
  res.render("resorts/new");
};

module.exports.createNewResort = async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.resort.location,
      limit: 1,
    })
    .send();

  const newResort = new Resort(req.body.resort);
  newResort.geometry = geoData.body.features[0].geometry;
  newResort.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  newResort.author = req.user._id;
  await newResort.save();
  req.flash("success", "New Resorts Created!");
  res.redirect(`/resorts/${newResort._id}`);
};

module.exports.detailResort = async (req, res) => {
  const { id } = req.params;
  const resort = await Resort.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author", // populate the author for each review
      },
    })
    .populate("author"); // populate the author for each resort
  if (!resort) {
    req.flash("error", "Can't find the resort.");
    res.redirect("/resorts");
  }
  res.render("resorts/detail", { resort });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const resort = await Resort.findById(id);
  if (!resort) {
    req.flash("error", "Can't find it.");
    res.redirect("/resorts");
  }
  res.render("resorts/edit", { resort });
};

module.exports.updateResort = async (req, res) => {
  const { id } = req.params;
  const updatedResort = await Resort.findByIdAndUpdate(id, {
    ...req.body.resort,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  updatedResort.images.push(...imgs);
  await updatedResort.save();
  // console.log(updatedResort._id);
  req.flash("success", "Resort Updated Successfully!");
  res.redirect(`/resorts/${updatedResort._id}`);
};

module.exports.deleteResort = async (req, res) => {
  const { id } = req.params;
  await Resort.findByIdAndDelete(id);
  req.flash("success", "Resort deleted.");
  res.redirect("/resorts");
};
