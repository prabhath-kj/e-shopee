import express from "express";
const router = express.Router();

router.use(function (req, res, next) {
  res.status(404);
  res.render("error", { status: 404 });
});

// Define route for handling 500 errors
router.use(function (err, req, res, next) {
  res.status(500);
  res.render("error", { status: 500 });
});

// Define route for handling 403 errors
router.use(function (err, req, res, next) {
  res.status(403);
  res.render("error", { status: 403 });
});
export default router;
