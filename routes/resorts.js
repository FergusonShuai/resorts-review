const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");

const resorts = require("../controllers/controller_resorts");
const { isLoggedIn, validateResort, isAuthor } = require("../middleware");
// adding multer middleware to support image uploading
const multer = require("multer");
const { storage } = require("../cloudinary"); // no need to specify /index.js, as node automatically locates index file.
const upload = multer({ storage });

/**********************Resort Model Routing*******************/
router
  .route("/")
  // Renter resorts page (a fancy way of chaining things. Not a big fan of it)
  .get(wrapAsync(resorts.index))
  // Creating a new resort
  .post(
    isLoggedIn,
    upload.array("images", 5),
    validateResort,
    wrapAsync(resorts.createNewResort)
  ); // images is the name of the file input.

router.get("/new", isLoggedIn, resorts.renderNewForm);

router.get("/:id", wrapAsync(resorts.detailResort));

// Even though "Starting with Express 5, route handlers and middleware that return a Promise will call next(value) automatically when they reject or throw an error. "
// This will only catch error raised by finById() function, not other errors, like form validation errors.
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  wrapAsync(resorts.renderEditForm)
);

// Updating a resort
router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  upload.array("images", 5),
  validateResort,
  wrapAsync(resorts.updateResort)
);

// Deleting a resort
router.delete("/:id", isLoggedIn, isAuthor, wrapAsync(resorts.deleteResort));

module.exports = router;
