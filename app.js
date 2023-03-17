require("dotenv").config();
const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const dbConfig = require("./config/db.config.js");
const session = require("express-session");
const mongoDBStore = require("connect-mongodb-session")(session);

//connect to mongodb
dbConfig.connectDB();

const mongoDBConnString = dbConfig.url;
const databaseName = dbConfig.database;

// function createSessionStore() {
//   return new mongoDBStore({
//     uri: mongoDBConnString,
//     databaseName: databaseName,
//     collection: "sessions",
//   });
// }

// function createSessionConfig() {
//   return {
//     secret: "key",
//     resave: false,
//     saveUninitialized: false,
//     store: createSessionStore(),
//     cookie: {
//       maxAge: 172800000,
//       sameSite: "lax",
//     },
//   };
// }

const usersRouter = require("./routes/users");
const adminRouter = require("./routes/admin");
const errorRoutes = require("./routes/error");

const app = express();

// view engine setup
app.set("view engine", "ejs");

app.set("views", "views");

// app.use(expressLayouts);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));

// session-handler
app.use(
  session({
    secret: "key",
    cookie: { maxAge: 600000 },
    saveUninitialized: false,
    resave: false,
  })
);
app.use(function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

app.use("/", usersRouter);
app.use("/admin", adminRouter);
app.use(errorRoutes);
/// Create session middleware
// app.use(session(createSessionConfig()));

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
