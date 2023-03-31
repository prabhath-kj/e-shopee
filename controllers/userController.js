import userHelper from "../helpers/userHelper.js";
import twilioFunctions from "../config/twilio.js";
import sendMail from "../config/nodeMailer.js";
import dotenv from "dotenv";
dotenv.config();

export default {
  //homepage
  homePage: async (req, res, next) => {
    let user = req.session.user;
    try {
      const allProductWithCategory = await userHelper.getAllProducts();
      const products = allProductWithCategory.products;
      const categories = allProductWithCategory.categories;
      if (user) {
        res.render("layout", {
          user,
          products,
          categories,
        });
      } else {
        res.render("layout", {
          user,
          products,
          categories,
        });
      }
    } catch (err) {
      console.error(err);
    }
  },
  listProductCategory: async (req, res) => {
    try {
      let user = req.session.user;
      const categoryId = req.query.category;
      const products = await userHelper.getAllProductsForList(categoryId);
      if (user) {
        res.render("productList", { user, products });
      }
      res.render("productList", { user: false, products });
    } catch (err) {
      console.error(err);
      res.json({ message: "succeess" });
    }
  },

  //signup
  signUpPage: (req, res) => {
    res.render("signup.ejs", {
      olduser: false,
      EmailSended: false,
      user: false,
    });
  },
  signUpPost: (req, res) => {
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
      // if (!token.status) {
      //   res.redirect("/");
      // }
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
    res.render("login", { loginErr: false, user: false });
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
    res.render("otp-login.ejs", {
      otpErr: false,
      loginErr: false,
      block: false,
      user: false,
    });
  },
  otpLoginPost: async (req, res) => {
    const mobNumber = req.body.phoneNumber;

    try {
      const validUser = await userHelper.getMobileNumber(mobNumber);
      if (validUser !== undefined && validUser !== false) {
        twilioFunctions
          .generateOTP(mobNumber, "sms")
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
    twilioFunctions
      .generateOTP(mobNumber, "sms")
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
    let mobNumber = req.body.mobNumber;
    try {
      const validUser = await userHelper.getMobileNumber(mobNumber);
      const enteredOTP = req.body.code;
      twilioFunctions.client.verify.v2
        .services(twilioFunctions.verifySid)
        .verificationChecks.create({ to: `+91${mobNumber}`, code: enteredOTP })
        .then((verification_check) => {
          if (verification_check.status === "approved") {
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
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Internal server error");
        });
    } catch (err) {
      console.error(err);
    }
  },

  forgotPassword: (req, res) => {
    res.render("forgotPassword.ejs", {
      otpErr: false,
      loginErr: false,
      user: false,
    });
  },

  generateOTP: async (req, res) => {
    try {
      const MobileNo = req.body.MobileNo;

      const validUser = await userHelper.getUser(MobileNo);
      if (validUser) {
        twilioFunctions
          .generateOTP(MobileNo, "sms")
          .then((verification) => {
            if (verification.status)
              res.render("verify-otp-forPassword", {
                loginErr: false,
                user: false,
                MobileNo: MobileNo,
              });
          })
          .catch((error) => {
            console.error(error);
            res.render("forgotPassword.ejs", {
              otpErr: true,
              loginErr: false,
              user: false,
            });
          });
      } else
        res.render("forgotPassword.ejs", {
          otpErr: false,
          loginErr: true,
          user: false,
        });
    } catch (err) {
      console.log(err);
    }
  },

  verifyOtpForPassword: async (req, res) => {
    try {
      const MobileNo = req.body.MobileNo;
      const user = await userHelper.getUser(MobileNo);
      const enteredOTP = req.body.code;
      twilioFunctions.client.verify.v2
        .services(twilioFunctions.verifySid)
        .verificationChecks.create({ to: `+91${MobileNo}`, code: enteredOTP })
        .then((verification_check) => {
          if (verification_check.status === "approved") {
            req.session.user = user;
            console.log(user);
            res.render("change-password", {
              Err: false,
              user: false,
            });
          } else {
            res.render("verify-otp-forPassword", {
              loginErr: true,
              user: false,
              MobileNo: MobileNo,
            });
          }
        })
        .catch((error) => {
          console.error(error);
          res.render("verify-otp-forPassword", {
            loginErr: true,
            user: false,
            MobileNo: MobileNo,
          });
        });
    } catch (err) {
      console.error(err);
    }
  },

  changePassword: async (req, res) => {
    try {
      const user = req.session.user;
      await userHelper.updatePassword(user._id, req.body.changedPassword);
      req.session.loggedIn = true;
      res.redirect("/");
    } catch (err) {
      res.render("change-password", {
        Err: true,
        user: false,
      });
      console.error(err);
    }
  },

  logOut: (req, res) => {
    req.session.loggedIn = false;
    delete req.session.user;
    res.redirect("/");

    // req.session.destroy((err) => {
    //   if (err) {
    //     console.log(err);
    //   } else {
    //     res.redirect("/");
    //   }
    // });
  },
  productView: async (req, res) => {
    let user = req.session.user;
    try {
      var products = await userHelper.getProductDetails(req.params.id);

      if (user) {
        res.render("product-view", { user, products });
      } else {
        res.render("product-view", { user, products });
      }
    } catch (err) {
      console.error(err);
    }
  },

  cartPage: async (req, res) => {
    try {
      let user = req.session.user;

      const items = await userHelper.getCartProducts(req.session.user._id);
      const { cartItems: products, subtotal } = items;

      if (!items) {
        res.render("cart", { user, products, total: subtotal });
        return;
      }
      res.render("cart", { user, products, total: subtotal });
    } catch (err) {
      console.error();
    }
  },
  addToCart: async (req, res) => {
    try {
      await userHelper.addToCart(req.params.id, req.session.user._id);
      res.json({
        status: "success",
        message: "product added to cart",
      });
    } catch (err) {
      console.error(err);
    }
  },
  removeProdctFromCart: async (req, res) => {
    try {
      console.log(req.body);
      await userHelper.removeProdctFromCart(req.body);
      res.json({
        status: "success",
        message: "product added to cart",
      });
    } catch (err) {
      console.error(err);
    }
  },
};
