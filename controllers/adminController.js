const { response } = require("express");
const adminHelper = require("../helpers/adminHelper");

module.exports = {
  adminPage: (req, res) => {
    if (req.session.loggedInad) {
      res.render("admin/layout");
    } else {
      res.render("admin/login", { adLogErr: false });
    }
  },
  dashboard: (req, res) => {
    if (req.session.loggedInad) {
      res.render("admin/dashboard");
    } else {
      res.redirect("admin/login");
    }
  },
  loginPage: (req, res) => {
    if (!req.session.loggedInad) res.render("admin/login", { adLogErr: false });
    else {
      res.redirect("/admin/dashboard");
    }
  },
  loginPost: (req, res) => {
    adminHelper.adminLogin(req.body).then((response) => {
      let admin = response.status;
      if (admin) {
        req.session.loggedInad = true;
        req.session.admin = response.validAdmin;
        res.redirect("/admin/dashboard");
      } else {
        res.render("admin/login", { adLogErr: true });
      }
    });
  },
  viewUser: (req, res) => {
    if (req.session.loggedInad) {
      adminHelper.getAllUsers().then((users) => {
        res.render("admin/view-user", { users });
      });
    } else {
      res.redirect("/admin");
    }
  },
};
