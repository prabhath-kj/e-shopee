var express = require("express");
var router = express.Router();
const adminController = require("../controllers/adminController");

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

module.exports = router;
