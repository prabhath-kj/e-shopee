var express = require("express");
var router = express.Router();

/* GET users listing. */
router.get("/login", function (req, res, next) {
  res.render("admin/login", { adLogErr: false, errorMessage: false });
});
router.post("/login", (req, res) => {
  if (req.body) {
    res.render("admin/layout");
  } else {
    res.render("admin/layout", { adLogErr: true });
  }
});
router.get("/dashboard", function (req, res, next) {
  res.render("admin/dashboard");
});

module.exports = router;
