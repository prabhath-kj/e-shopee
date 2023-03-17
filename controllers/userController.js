const userHelper = require("../helpers/userHelper");
const adminHelper = require("../helpers/adminHelper");

module.exports = {
  //homepage
  homePage: async (req, res, next) => {
    let user = req.session.user;

    if (user) {
      res.render("layout", {
        user,
        //       products,
        //       cartCount,
      });
      //   userHelper.getCartCount().then((cartCount) => {
      //     console.log(cartCount);
      //   });
      //   let cartCount = req.session.cartCount;
      //   adminHelper.getAllProducts().then((products) => {
      //     res.render("layout", {
      //       user,
      //       products,
      //       cartCount,
      //     });
      //   });
    } else {
      res.render("layout", { user });
    }
  },

  //signup
  signUpPage: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    }
    res.render("signup.ejs", {
      registered: false,
      olduser: false,
      user: false,
    });
  },
  signUpPost: (req, res) => {
    userHelper.doSignUp(req.body).then((userData) => {
      let olduser = userData.status;
      if (olduser) {
        res.render("signup", {
          registered: false,
          olduser: true,
          user: false,
        });
      }
      res.render("signup", { registered: true, olduser: false, user: false });
    });
  },
  loginPage: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("login", { loginErr: false, user: false });
    }
  },

  loginPost: (req, res) => {
    console.log("hi iam here");
    userHelper.doLogin(req.body).then((response) => {
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.validUser;
        res.redirect("/");
      } else {
        res.render("login", { loginErr: true, user: false });
      }
    });
  },
  logOut: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  },
};
