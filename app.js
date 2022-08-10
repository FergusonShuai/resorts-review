if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const resortRoutes = require("./routes/resorts");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const User = require("./models/user");
const mongodbUrl = process.env.MONGODB_URL;

mongoose
  .connect(mongodbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //, useFindAndModify: false
  })
  .then(() => {
    console.log("MongoDB connection established.");
  })
  .catch((err) => {
    console.log("MongoDB Connection failed.");
    console.log(err);
  });

app.engine("ejs", ejsMate);
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true })); // for every incoming request, use urlencoded() middleware function
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(mongoSanitize());
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const secret = process.env.SECRET;

const store = new MongoStore({
  mongoUrl: mongodbUrl,
  secret: secret,
  touchAfter: 24 * 60 * 60, // in seconds
});

store.on("error", function (e) {
  console.log("Session store error", e);
});

const sessionConfig = {
  store,
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // when the cookie will expire.
    maxAge: 1000 * 60 * 60 * 24 * 7, // in milliseconds
  },
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  // some global variable that can be accessed by all templates.
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user; // coming from passport
  next();
});

app.get("/", (req, res) => {
  res.render("home");
});

/**********************User Authentication********************** */
app.use("/", userRoutes);

/**********************Resort Model Routing*******************/
app.use("/resorts", resortRoutes);

/**********************Review Routing *************************/
app.use("/resorts", reviewRoutes);

/****************Put this after all route handler - only when requests slipped through all the handlers will trigger this.************/
app.use("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});
// err passed through from previous step
app.use((err, req, res, next) => {
  // Destructure the err.
  const { statusCode = 500 } = err;
  if (!err.message) {
    err.message = "Something Went Wrong.";
  }
  res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`App is up and running on port ${port}.`);
});
