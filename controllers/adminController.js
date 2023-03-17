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
      const status = req.query.status || "";

      try {
        adminHelper.getAllUsers(status).then((users) => {
          res.render("admin/view-user", { users });
        });
      } catch (err) {
        console.error(err);
        res.redirect("/admin");
      }
    } else {
      res.redirect("/admin");
    }
  },
  logOut: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/admin");
      }
    });
  },
  blockUser: async (req, res) => {
    if (req.session.loggedInad) {
      let userId = req.params.id;
      try {
        await adminHelper.blockUser(userId);
        res.redirect("/admin/view-user");
      } catch (error) {
        console.error(error);
      }
    }
  },
  unblockUser: async (req, res) => {
    if (req.session.loggedInad) {
      let userId = req.params.id;
      try {
        await adminHelper.unblockUser(userId);
        res.redirect("/admin/view-user");
      } catch (err) {
        console.error(err);
      }
    }
  },

  category: async (req, res) => {
    if (req.session.loggedInad) {
      try {
        const viewCategory = await adminHelper.getAllCategory();
        res.render("admin/category", {
          viewCategory,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      res.redirect("/admin/dashboard");
    }
  },
  addCategory: async (req, res) => {
    try {
      await adminHelper.addCategory(req.body);
      res.redirect("/admin/category");
    } catch (err) {
      console.error(err);
    }
  },
  deleteCategory: async (req, res) => {
    let categoryId = req.params.id;
    console.log(categoryId);
    try {
      await adminHelper.delete(categoryId);
      res.redirect("/admin/category");
    } catch (err) {
      console.error(err);
    }
  },
};
