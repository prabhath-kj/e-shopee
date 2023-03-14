const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// /* GET home page. */
router.get("/", userController.homePage);

//sign up
router.get("/signup", userController.signUpPage);

router.post("/signup", userController.signUpPost);
//Login Page

router.get("/login", userController.loginPage);

router.post("/login", userController.loginPost);

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
