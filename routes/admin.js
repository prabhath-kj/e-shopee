var express = require("express");
var router = express.Router();
const adminController = require("../controllers/adminController");
const upload = require("../config/diskStorage");
const cloudinary = require("../config/cloudinary");


/* GET users listing. */

router.get("/", adminController.adminPage);

router.get("/dashboard", adminController.dashboard);

router.get("/login", adminController.loginPage);

router.post("/login", adminController.loginPost);

router.get("/logout", adminController.logOut);

router.get("/view-user", adminController.viewUser);

router.get("/block-user/:id", adminController.blockUser);

router.get("/unblock-user/:id", adminController.unblockUser);

router.get("/category", adminController.category);

router.post("/add-category", adminController.addCategory);

router.get("/delete-category/:id", adminController.deleteCategory);

router.get("/products", adminController.getAllProducts);

router.get("/add-products", adminController.addProducts);

router.post(
  "/add-products",
  upload.array("productImage", 4),
  async (req, res) => {
    try {
      const files = req.files;
      const results = await Promise.all(
        files.map((file) => cloudinary.uploader.upload(file.path))
      );

      await adminController.adProductsPost(results, req.body);
      req.session.productUploaded = true;

      res.redirect("/admin/add-products");
    } catch (err) {
      console.error(err);
      req.session.productUploadError = true;

      res.redirect("/admin/add-products");
    }
  }
);

//Edit Product Page
router.get("/edit-product/:id", adminController.editProduct);

router.post(
  "/edited-product/:id",
  upload.array("productImage", 4),
  async (req, res) => {
    try {
      const files = req.files;
      const results = await Promise.all(
        files.map((file) => cloudinary.uploader.upload(file.path))
      );

      await adminController.editProductPost(results, req.body, req.params.id);

      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.session.productUploadError = true;

      res.redirect("/admin/edit-product");
    }
  }
);
router.get("/unlist-product/:id", adminController.unlistProduct);

// router.get("/delete-product/:id", adminController.deleteProduct);
module.exports = router;
