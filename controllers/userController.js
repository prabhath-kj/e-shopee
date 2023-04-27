import userHelper from "../helpers/userHelper.js";
import twilioFunctions from "../config/twilio.js";
import sendMail from "../config/nodeMailer.js";
import dotenv from "dotenv";
import adminHelper from "../helpers/adminHelper.js";
import instance from "../config/paymentGateway.js";
import CryptoJS from "crypto-js";
import { generateInvoice, generateSalesReport } from "../config/pdfKit.js";
import { sendInvoiceByEmail } from "../config/nodeMailer.js";
dotenv.config();

export default {
  //homepage
  homePage: async (req, res, next) => {
    let user = req.session.user;
    try {
      const allProductWithCategory = await userHelper.getAllProducts();
      const products = allProductWithCategory.products;
      const categories = allProductWithCategory.categories;
      const banners = await userHelper.getListedBanner();
      if (user) {
        // user.count =
        res.render("layout", {
          user,
          products,
          categories,
          banners,
        });
      } else {
        res.render("layout", {
          user,
          products,
          categories,
          banners,
        });
      }
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  listProductCategory: async (req, res) => {
    try {
      let user = req.session.user;
      const { category: categoryId, sort } = req.query;
      const products = await userHelper.getAllProductsForList(
        categoryId,
        sort,
        user?._id
      );
      console.log(products);
      if (user) {
        res.render("productList", { user, products });
      }
      res.render("productList", { user: false, products });
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
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
      console.log(userData);
      let user = userData;
      if (!user.status) {
        let token = user.newToken.token;

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
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
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
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  resendOTp: async (req, res) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    }
    const mobNumber = req.query.mobNumber;
    console.log(mobNumber);
    twilioFunctions
      .generateOTP(mobNumber, "sms")
      .then((verification) => {
        if (verification.status == "pending") {
          res.json({ status: "success" });
          return;
        } else {
          res.json({ status: "error" });
          return;
        }
      })
      .catch((error) => {
        console.error(error);
        res.render("catchError", {
          message: error.message,
          user: req.session.user,
        });
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
          res.render("catchError", {
            message: error.message,
            user: req.session.user,
          });
        });
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
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
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
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
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
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
    let user = req.session?.user;
    const slug = req.params.slug;

    try {
      var products = await userHelper.getProductDetails(slug, user?._id);

      res.render("product-view", { user, products });
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  cartPage: async (req, res) => {
    try {
      let user = req.session.user;

      const items = await userHelper.getCartProducts(req.session.user._id);
      if (items === null) {
        res.render("emptyCart", { user });
        return;
      }
      const { cartItems: products, subtotal } = items;

      res.render("cart", { user, products, total: subtotal });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  addToCart: async (req, res) => {
    try {
      const response = await userHelper.addToCart(
        req.params.id,
        req.session.user._id
      );
      if (response) {
        res.json({
          status: "success",
          message: "product added to cart",
        });
      } else {
        res.json({
          error: "error",
          message: "product added to cart",
        });
      }
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  changeProductQuantity: async (req, res) => {
    try {
      const [userId, productId, count] = req.body.product;
      const response = await userHelper.updateQuantity(
        userId,
        productId,
        count
      );
      if (response === false) {
        res.json({ error: "success" });
        return;
      }
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      res.json({ status: "error" });
    }
  },

  removeProdctFromCart: async (req, res) => {
    try {
      await userHelper.removeProductFromCart(req.body);
      res.json({
        status: "success",
        message: "product added to cart",
      });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  removeProdctFromWishLIst: async (req, res) => {
    try {
      await userHelper.removeProdctFromWishLIst(
        req.session.user._id,
        req.body.product
      );
      res.json({
        status: "success",
        message: "product added to cart",
      });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  addToWishList: async (req, res) => {
    try {
      const response = await userHelper.addToWishListUpdate(
        req.session.user._id,
        req.body.product_id
      );
      if (!response) {
        res.json({ error: true });
        return;
      } else if (response === "removed") {
        res.json({ removeSuccess: true });
        return;
      }
      res.json({ success: true });
    } catch (err) {
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },

  wishlist: async (req, res) => {
    try {
      const showList = await userHelper.showWishlist(req.session.user._id);
      console.log(showList);
      res.render("wishlist", { user: req.session.user, showList });
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },
  addToCartFromWish: async (req, res) => {
    try {
      const response = await userHelper.addToCartFromWish(
        req.params.id,
        req.session.user._id
      );
      if (response) {
        res.json({
          status: "success",
          message: "product added to cart",
        });
      } else {
        res.json({
          error: "error",
          message: "product not added to cart",
        });
      }
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  getCartCount: async (req, res) => {
    try {
      let user = req.session.user; // retrieve currently authenticated user
      let count = await userHelper.getCartCount(user._id); // count items in cart for user
      res.json({ count: count });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },
  getWishCount: async (req, res) => {
    try {
      let user = req.session.user; // retrieve currently authenticated user
      let count = await userHelper.countWish(user._id); // count items in wishlist for user
      res.json({ count: count });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },
  checkOut: async (req, res) => {
    try {
      let user = req.session.user;
      console.log(user);
      const items = await userHelper.getCheckoutProducts(req.session.user._id);
      if (!items) {
        res.json({ items });
        return;
      }

      const address = await userHelper.getDefaultAddress(req.session.user._id);
      const { cartItems: products, subtotal } = items;
      res.render("checkout", { user, products, subtotal, address });
    } catch (error) {
      res.render("catchError", {
        message: error?.message,
        user: req.session.user,
      });
    }
  },

  placeOrderPost: async (req, res) => {
    try {
      const { userId, paymentMethod, totalAmount, couponCode } = req.body;

      const response = await userHelper.placeOrder(
        userId,
        paymentMethod,
        totalAmount,
        couponCode,
        req.body
      );
      if (response.payment_method == "cash_on_delivery") {
        res.json({ codstatus: "success" });
      } else if (response.payment_method == "online_payment") {
        // const order = generatePaymenetGateway(response);
        const paymentOptions = {
          amount: response.total_amount * 100,
          currency: "INR",
          receipt: "" + response._id,
          payment_capture: 1,
        };

        const order = await instance.orders.create(paymentOptions);
        res.json(order);
      } else if (response.payment_method == "wallet") {
        res.json({ codstatus: "success" });
      }
    } catch (err) {
      console.error(err);
      res.json({ status: "error" });
    }
  },

  addAddress: async (req, res) => {
    try {
      res.render("add-address", { user: req.session.user });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  selectAddress: async (req, res) => {
    try {
      const address = await userHelper.getAddress(req.session.user._id);
      res.render("address", { user: req.session.user, address });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  addAddressPost: async (req, res) => {
    try {
      let { userId } = req.body;
      let address = req.body;
      await userHelper.addAddressPost(userId, address);
      res.redirect("/address");
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  select: async (req, res) => {
    try {
      await userHelper.updateAddress(req.params.id, req.session.user._id);
      res.json({ status: "success" });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
    // res.json({ status: "success" });
  },

  deleteAddress: async (req, res) => {
    try {
      await userHelper.deleteAddress(req.params.id);
      res.json({ status: "success" });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  getOrderDetails: async (req, res) => {
    try {
      const orderHistory = await userHelper.getOrderHistory(
        req.session.user._id
      );

      const orderDetails = orderHistory.reverse();
      res.render("order", { user: req.session.user, orderDetails });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },
  orderSuccess: async (req, res) => {
    try {
      res.render("placeOrderSuccess", { user: req.session.user });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  orderFailed: async (req, res) => {
    try {
      res.render("payment-failure", { user: req.session.user });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  viewOrder: async (req, res) => {
    try {
      const currentOrder = await adminHelper.getSpecificOrder(req.params.id);
      const { productDetails, order } = currentOrder;
      console.log(order);

      res.render("view-order", {
        user: req.session.user,
        productDetails,
        order,
      });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  removeOrder: async (req, res) => {
    try {
      await userHelper.cancelOrder(req.body.arguments[0]);
      res.json({ status: "success" });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  returnOrder: async (req, res) => {
    try {
      await userHelper.returnOrder(req.body.orderId, req.body.reason);
      res.json({ status: "success" });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  getAllCoupons: async (req, res) => {
    try {
      const coupons = await userHelper.getCoupons(req.session.user._id);
      res.render("all-coupons", { user: req.session.user, coupons });
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  applyCoupon: async (req, res) => {
    try {
      const { code, total } = req.body;
      const response = await userHelper.applyCoupon(
        code,
        total,
        req.session.user._id
      );
      res.json(response);
    } catch (err) {
      res.render("catchError", {
        message: err.message,
        user: req.session.user,
      });
    }
  },

  profile: async (req, res) => {
    try {
      res.render("editProfile", { user: req.session.user });
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },

  editPassword: async (req, res) => {
    try {
      const { id, currentPassword, newPassword } = req.body;
      const response = await userHelper.editPasswordUpdate(
        id,
        currentPassword,
        newPassword
      );
      if (response) {
        res.json({ status: "success" });
      }
      res.json({ error: "success" });
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },

  verifyPayment: async (req, res) => {
    try {
      const { payment, order } = req.body;

      const razorpayOrderId = payment.razorpay_order_id;
      const razorpayPaymentId = payment.razorpay_payment_id;
      const razorpaySecret = process.env.KEYSECRET;
      const razorpaySignature = payment.razorpay_signature;

      // Concatenate order_id and payment_id
      const message = razorpayOrderId + "|" + razorpayPaymentId;

      // Generate a HMAC SHA256 hash of the message using the secret key
      const generatedSignature = CryptoJS.HmacSHA256(
        message,
        razorpaySecret
      ).toString(CryptoJS.enc.Hex);

      // Compare the generated signature with the received signature
      if (razorpaySignature === generatedSignature) {
        await userHelper.changeOnlinePaymentStatus(
          order.receipt,
          req.session.user._id
        );
        res.json({ status: "success" });
      } else {
        res.json({ error: "error" });
      }
      console.log(payment);
      console.log(order);
    } catch (err) {
      console.error(err);
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },
  search: async (req, res) => {
    try {
      const search = req.query.search;
      const products = await userHelper.searchQuery(
        search,
        req.session.user?._id
      );
      console.log(products);
      res.render("productList", { user: req.session.user, products });
    } catch (err) {
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },

  downloadInvoice: async (req, res) => {
    try {
      const order_id = req.params.id;
      console.log(order_id);
      // Generate the PDF invoice
      const order = await adminHelper.getSpecificOrder(order_id);

      const { order: invoiceData, productDetails } = order;
      console.log(invoiceData);
      const invoicePath = await generateInvoice(invoiceData, productDetails);

      // Download the generated PDF
      res.download(invoicePath, (err) => {
        if (err) {
          console.error("Failed to download invoice:", err);
          res.render("catchError", {
            message: err.message,
            user: req.session.user,
          });
        }
      });
    } catch (error) {
      console.error("Failed to download invoice:", error);
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },

  mailInvoice: async (req, res) => {
    try {
      const email = req.session.user.email;
      const order_id = req.params.id;
      console.log(order_id);
      // Generate the PDF invoice
      const order = await adminHelper.getSpecificOrder(order_id);

      const { order: invoiceData, productDetails } = order;
      console.log(invoiceData);
      const invoicePath = await generateInvoice(invoiceData, productDetails);
      await sendInvoiceByEmail(invoicePath, email);
      // Download the generated PDF
      res.json({ status: "success" });
    } catch (err) {
      console.error("Failed to download invoice:", err);
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },

  filterProducts: async (req, res) => {
    try {
      const { sort } = req.query;
      console.log(sort);
      const products = await userHelper.sortQuery(sort, req.session.user?._id);
      res.render("productList", { user: req.session.user, products });
    } catch (err) {
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },

  updateProfile: async (req, res) => {
    try {
      const { updateName, gender, updateEmail, updateMobNumber } = req.body;
      const response = await userHelper.updataUserProfile(
        req.session.user._id,
        updateName,
        gender,
        updateEmail,
        updateMobNumber
      );
      if (!response) {
        res.json({ error: "error" });
        return;
      }
      res.json({ status: "success" });
    } catch (err) {
      res.render("catchError", {
        message: err?.message,
        user: req.session.user,
      });
    }
  },
};
