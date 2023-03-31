import express from "express";
const router = express.Router();
import userController from "../controllers/userController.js";
import { isLoggedIn, isUser } from "../middileware/sessionHandling.js";

// /* GET home page. */
router.get("/", userController.homePage);

//sign up
router.get("/signup", isLoggedIn, userController.signUpPage);

router.post("/signup", userController.signUpPost);

router.get("/users/:id/verify/:token", userController.verifyToken);

//Login Page

router.get("/login", isLoggedIn, userController.loginPage);

router.post("/login", isLoggedIn, userController.loginPost);

router.get("/otp-login", isLoggedIn, userController.otpLogin);

router.post("/otp-login", isLoggedIn, userController.otpLoginPost);

router.get("/resendOTP", isLoggedIn, userController.resendOTp);

router.post("/verify-mob", isLoggedIn, userController.verifyOtp);

router.get("/forgotpassword", isLoggedIn, userController.forgotPassword);

router.post("/verify-forgotPassword", userController.generateOTP);

router.post(
  "/verify-mobileNumberForPassword",
  userController.verifyOtpForPassword
);

router.post("/change-password", isLoggedIn, userController.changePassword);

//LOGOUT
router.get("/logout", userController.logOut);

//Product List view
router.get("/productsList", userController.listProductCategory);

//Product View Page
router.get("/product-view/:id",isUser, userController.productView);

//add To Cart
router.get("/add-to-cart/:id", isUser, userController.addToCart);

//remove product

router.post(
  "/remove-product-from-cart",
  isUser,
  userController.removeProdctFromCart
);

//Cart Page
router.get("/cart", isUser, userController.cartPage);

export default router;
