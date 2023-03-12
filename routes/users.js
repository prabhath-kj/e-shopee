const express = require("express");
const router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("layout", { user: false });
});

router.get("/signup", (req, res) => {
  res.render("signup.ejs", { registered: false, olduser: false, user: false });
});
router.post("/signup", (req, res) => {
  console.log(req.body);
  res.send("got it");
});
router.get("/login", (req, res) => {
  res.render("login.ejs", { loginErr: false, user: false });
});
router.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword.ejs", {
    otpErr: false,
    loginErr: false,
    user: false,
  });
});
router.get("/otp-login", (req, res) => {
  res.render("otp-login.ejs", { otpErr: false, loginErr: false, user: false });
});
router.get("/logout", (req, res) => {
  res.redirect("/");
});
module.exports = router;
