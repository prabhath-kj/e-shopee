const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// /* GET home page. */
router.get("/", userController.homePage);

//sign up
router.get("/signup", userController.signUpPage);

router.post("/signup", userController.signUpPost);

router.get("/users/:id/verify/:token",userController.verifyToken)
//Login Page

router.get("/login", userController.loginPage);

router.post("/login", userController.loginPost);

router.get("/otp-login", userController.otpLogin);

router.post("/otp-login", userController.otpLoginPost);

router.get("/resendOTP", userController.resendOTp);

router.post("/verify-mob", userController.verifyOtp);


//LOGOUT
router.get("/logout", userController.logOut);

router.get("/product-view/:id", userController.productView); //Product View Page

router.get("/forgotpassword", (req, res) => {
  res.render("forgotpassword.ejs", {
    otpErr: false,
    loginErr: false,
    user: false,
  });
});

module.exports = router;
