import express from "express";
const router = express.Router();
import adminController from "../controllers/adminController.js";
import upload from "../config/diskStorage.js";
import { isloggedInad } from "../middileware/sessionHandling.js";

/* GET users listing. */

router.get("/", isloggedInad, adminController.adminPage);

router.get("/dashboard", isloggedInad, adminController.dashboard);

router.get("/login", adminController.loginPage);

router.post("/login", adminController.loginPost);

router.get("/logout", isloggedInad, adminController.logOut);

router.get("/view-user", isloggedInad, adminController.viewUser);

router.get("/block-user/:id", isloggedInad, adminController.blockUser);

router.get("/unblock-user/:id", isloggedInad, adminController.unblockUser);

router.get("/category", isloggedInad, adminController.category);

router.post("/add-category", isloggedInad, adminController.addCategory);

router.post("/edit-category/:id", adminController.editCategory);

router.get(
  "/delete-category/:id",
  isloggedInad,
  adminController.deleteCategory
);

router.get("/list-category/:id", isloggedInad, adminController.listCategory);

router.get("/products", isloggedInad, adminController.getAllProducts);

router.get("/add-products", isloggedInad, adminController.addProducts);

router.post(
  "/add-products",
  upload.array("productImage", 4),
  adminController.adProductsPost
);

//Edit Product Page
router.get("/edit-product/:id", isloggedInad, adminController.editProduct);

router.post(
  "/edited-product/:id",
  upload.array("productImage", 4),
  adminController.editProductPost
);

router.get("/unlist-product/:id", isloggedInad, adminController.unlistProduct);

//banner
router
  .route("/add-banner")
  .get(isloggedInad, adminController.addBanner)
  .post(
    isloggedInad,
    upload.single("productImage"),
    adminController.addBannerPost
  );

//view banner
router.get("/banner-list", isloggedInad, adminController.viewBanner);

//remove banner
router.get("/remove-banner/:id", isloggedInad, adminController.removeBanner);

//list banner
router.get("/list-banner/:id", isloggedInad, adminController.ListBanner);

//order-management
router.get("/order-management", isloggedInad, adminController.orderDetails);

router.get("/view-order/:id", isloggedInad, adminController.viewOrder);

router.post(
  "/update-order-status",
  isloggedInad,
  adminController.updateOrderStatus
);

router
  .route("/add-coupon")
  .get(isloggedInad, adminController.addCoupon)
  .post(isloggedInad, adminController.addCouponPost);

router.post("/remove-coupon", isloggedInad, adminController.removeCoupon);

router.get("/view-coupon", isloggedInad, adminController.viewCoupon);

//sales report

router.get("/sales-report",isloggedInad, adminController.viewReport)

router.post("/sales-report",isloggedInad, adminController.viewReportByDate);

export default router;
