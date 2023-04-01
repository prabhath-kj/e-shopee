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

router.get(
  "/delete-category/:id",
  isloggedInad,
  adminController.deleteCategory
);

router.get("/products", isloggedInad, adminController.getAllProducts);

router.get("/add-products", isloggedInad, adminController.addProducts);

router.post(
  "/add-products",
  upload.array("productImage", 4),
  adminController.adProductsPost
);

//Edit Product Page
router.get("/edit-product/:id", isloggedInad, adminController.editProduct);

router.post("/edited-product/:id", upload.array("productImage", 4),adminController.editProductPost);

router.get("/unlist-product/:id", isloggedInad, adminController.unlistProduct);

router.get("/add-banner", isloggedInad, adminController.addBanner);

// router.get("/delete-product/:id", adminController.deleteProduct);

export default router;
