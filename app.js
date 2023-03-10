const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const mongoose = require("mongoose");
const dbConfig = require("./config/db.config.js");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);

mongoose
  .connect(dbConfig.url)
  .then(() => {
    console.log("Connected to the database.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

const mongoDBConnString = dbConfig.url;
const databaseName = dbConfig.database;

function createSessionStore() {
  return new mongoDBStore({
    uri: mongoDBConnString,
    databaseName: databaseName,
    collection: "sessions",
  });
}

function createSessionConfig() {
  return {
    secret: "key",
    resave: false,
    saveUninitialized: false,
    store: createSessionStore(),
    cookie: {
      maxAge: 172800000,
      sameSite: "lax",
    },
  };
}

const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");

const app = express();

// view engine setup
app.set("view engine", "ejs");

app.set("views", path.join(__dirname, "views"));

// app.use(expressLayouts);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", usersRouter);
app.use("/admin", adminRouter);

/// Create session middleware
app.use(session(createSessionConfig()));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
