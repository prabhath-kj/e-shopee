var express = require("express");
var router = express.Router();
const adminController = require("../controllers/adminController");

/* GET users listing. */

router.get("/", adminController.adminPage);

router.get("/dashboard", adminController.dashboard);

router.get("/login", adminController.loginPage);

router.post("/login", adminController.loginPost);

router.get("/view-user", adminController.viewUser);

module.exports = router;
