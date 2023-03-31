import dotenv from "dotenv";
import createError from "http-errors";
import express from "express";
import cookieParser from "cookie-parser";
import logger from "morgan";
import http from "http";
import debug from "debug";
import mongoose from "mongoose";
import connectDB from "./config/db.config.js";
import session from "express-session";


// Load environment variables from .env file
dotenv.config();

// Connect to mongodb
connectDB();

// Create Express app
const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", "views");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.use("/node_modules", express.static("node_modules"));

// Session handler
app.use(
  session({
    secret: "key",
    cookie: { maxAge: 600000 },
    saveUninitialized: false,
    resave: false,
  })
);

// Set headers for all responses
app.use(function (req, res, next) {
  res.header(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});

// Routes
import usersRouter from "./routes/users.js";
import adminRouter from "./routes/admin.js";
import errorRoutes from "./routes/error.js";
app.use("/", usersRouter);
app.use("/admin", adminRouter);
app.use(errorRoutes);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render("error");
});

// Create HTTP server
const server = http.createServer(app);

// Set port
const PORT = normalizePort(process.env.PORT || "3000");
app.set("port", PORT);

// Listen on provided port, on all network interfaces
mongoose.connection.once("open", () => {
  console.log("Connected to the database.");
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});

// Event listener for HTTP server "error" event
const onError = (error) => {
  if (error.syscall !== "listen") {
    throw error;
  }

  const bind = typeof PORT === "string" ? `Pipe ${PORT}` : `Port ${PORT}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
};

server.on("error", onError);

// Event listener for HTTP server "listening" event
const onListening = () => {
  const addr = server.address();
  const bind = typeof addr === "string" ? `pipe ${addr}` : `port ${addr.port}`;
  debug(`Listening on ${bind}`);
};
server.on("listening", onListening)



/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}
