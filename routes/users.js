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
router.get("/product-view/:id", userController.productView);

//add To Cart
router.get("/add-to-cart/:id", isUser, userController.addToCart);

//remove product
router.post(
  "/remove-product-from-cart",
  isUser,
  userController.removeProdctFromCart
);

router.post("/change-product-quantity", userController.changeProductQuantity);

//Cart Page
router.get("/cart", isUser, userController.cartPage);

//checkout
router.get("/checkout", isUser, userController.checkOut);

router.get("/address", isUser, userController.selectAddress);

router.get("/add-address", isUser, userController.addAddress);

router.post("/add-address", isUser, userController.addAddressPost);

router.get("/select-address/:id", isUser, userController.select);

router.get("/delete-address/:id", isUser, userController.deleteAddress);

//place order
router.post("/place-order", isUser, userController.placeOrderPost);

router.get("/order-success", isUser, userController.orderSuccess);

router.get("/order-failed", isUser, userController.orderFailed);


router.get("/orders", isUser, userController.getOrderDetails);

router.get("/view-order-products/:id", isUser, userController.viewOrder);

router.post("/cancelOrder", isUser, userController.removeOrder);

router.put("/returnOrder", isUser, userController.returnOrder);

//edit profile

router.get("/edit-profile", isUser, userController.profile);

router.post("/edit-password",isUser,userController.editPassword)

// All coupons

router.get("/all-coupons", isUser, userController.getAllCoupons);

router.post("/apply-coupon", isUser, userController.applyCoupon);

router.post("/verify-payment",isUser,userController.verifyPayment)


//search

router.get("/product-search",userController.search)

//download invoice

router.get('/download-invoice/:id',isUser,userController.downloadInvoice)

router.get('/mail-invoice/:id',isUser,userController.mailInvoice)

//wish list

router.get('/wishlist',isUser,userController.wishlist)
export default router;
