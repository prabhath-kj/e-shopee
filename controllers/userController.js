const userHelper = require("../helpers/userHelper");
const adminHelper = require("../helpers/adminHelper");
const { verifySid, client, generateOTP } = require("../config/twilio");
const { response, urlencoded } = require("express");
const sendMail = require("../config/nodeMailer");
require("dotenv").config();

module.exports = {
  //homepage
  homePage: async (req, res, next) => {
    let user = req.session.user;
    try {
      var products = await adminHelper.getAllProducts();
    } catch (err) {
      console.error(err);
    }

    if (user) {
      res.render("layout", {
        user,
        products,
      });
    } else {
      res.render("layout", { user, products });
    }
  },

  //signup
  signUpPage: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    }

    res.render("signup.ejs", {
      olduser: false,
      EmailSended: false,
      user: false,
    });
  },
  signUpPost: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    }
    userHelper.doSignUp(req.body).then((userData) => {
      let user = userData;
      let token = user.newToken.token;
      console.log(token);
      if (!user.status) {
        const url = `${process.env.BASE_URL}users/${user.user._id}/verify/${token}`;
        sendMail(user.user.email, "Verify Email", url);
        res.status(201);
        res.render("signup", {
          olduser: false,
          EmailSended: true,
          user: false,
        });
        // res.redirect("/");
      } else {
        // If the user already exists, show the signup page with an error
        res.render("signup", {
          EmailSended: false,
          olduser: true,
          user: false,
        });
      }
    });
  },

  verifyToken: async (req, res) => {
    try {
      const user = await userHelper.findUser(req.params.id);
      if (!user) return res.status(400).send({ message: "invalid link" });
      const token = await userHelper.findToken(user, req.params.token);
      if (!token.status) {
        res.redirect("/");
      }
      res.status(201);
      // If the user is verified, redirect to the homepage
      req.session.loggedIn = true;
      req.session.user = user;
      res.redirect("/");
    } catch (err) {
      console.error(err);
    }
  },

  loginPage: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("login", { loginErr: false, user: false });
    }
  },

  loginPost: (req, res) => {
    userHelper.doLogin(req.body).then((user) => {
      let response = user;
      if (response.status) {
        req.session.loggedIn = true;
        req.session.user = response.user;
        res.redirect("/");
      } else {
        res.render("login", { loginErr: true, user: false });
      }
    });
  },

  otpLogin: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    }
    res.render("otp-login.ejs", {
      otpErr: false,
      loginErr: false,
      block: false,
      user: false,
    });
  },
  otpLoginPost: async (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    }
    const mobNumber = req.body.phoneNumber;

    try {
      const validUser = await userHelper.getMobileNumber(mobNumber);
      if (validUser !== undefined && validUser !== false) {
        generateOTP(mobNumber, "sms")
          .then((verification) => {
            res.render("verify-mob", {
              loginErr: false,
              user: false,
              mobNumber: mobNumber,
            });

            console.log(verification.status);
          })
          .catch((err) => {
            console.error(err);

            res.render("otp-login.ejs", {
              otpErr: true,
              loginErr: false,
              user: false,
              block: false,
            });
          });
      } else if (validUser == undefined) {
        res.render("otp-login.ejs", {
          otpErr: false,
          block: false,
          loginErr: true,
          user: false,
        });
      } else {
        res.render("otp-login.ejs", {
          otpErr: false,
          block: true,
          loginErr: false,
          user: false,
        });
      }
    } catch (err) {
      console.error(err);
    }
  },
  resendOTp: async (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    }
    const mobNumber = req.query.mobNumber;
    generateOTP(mobNumber, "sms")
      .then((verification) => {
        if (verification.status)
          res.render("verify-mob", {
            loginErr: false,
            user: false,
            mobNumber: mobNumber,
          });
      })
      .catch((error) => {
        console.error(error);
      });
  },

  verifyOtp: async (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    }
    let mobNumber = req.body.mobNumber;
    try {
      const validUser = await userHelper.getMobileNumber(mobNumber);
      const enteredOTP = req.body.code;
      client.verify.v2
        .services(verifySid)
        .verificationChecks.create({ to: `+91${mobNumber}`, code: enteredOTP })
        .then((verification_check) => {
          if (verification_check.status) {
            req.session.user = validUser;
            req.session.loggedIn = true;
            if (req.session.user) {
              res.redirect("/");
            }
          } else {
            res.render("verify-mob", {
              loginErr: true,
              user: false,
              mobNumber: mobNumber,
            });
          }
          // handle the verification status
        })
        .catch((error) => {
          console.error(error);
          // handle error
        });
    } catch (err) {
      console.error(err);
    }
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
  productView: async (req, res) => {
    let user = req.session.user;
    try {
      var products = await adminHelper.getProductDetails(req.params.id);
    } catch (err) {
      console.error(err);
    }
    if (user) {
      res.render("product-view", { user, products });
    } else {
      res.render("product-view", { user, products });
    }
  },
};
