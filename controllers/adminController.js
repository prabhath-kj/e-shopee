import adminHelper from "../helpers/adminHelper.js";
import convert from "color-convert";
import cloudinary from "../config/cloudinary.js";
import { generateInvoice, generateSalesReport } from "../config/pdfKit.js";

export default {
  adminPage: (req, res) => {
    let admin = req.admin;
  if(admin){
    res.redirect("/admin/dashboard");
  }
  else{
    res.redirect("/admin");

  }
  },

  dashboard: async (req, res) => {
    let admin = req.admin;

    if (admin) {
      const totalRevenue = await adminHelper.findTotalRevenue();
      const orders = await adminHelper.getOrderDetails();
      const orderCount = orders.length;
      const products = await adminHelper.getAllProducts();
      const productsCount = products.length;
      const users = await adminHelper.getAllUsers();
      const usersCount = users.length;
      const orderData = await adminHelper.orderStatusData();
      const paymentStatitics = await adminHelper.paymentStatitics();
      res.render("admin/dashboard", {
        totalRevenue,
        orderCount,
        productsCount,
        usersCount,
        orderData,
        paymentStatitics,
      });
    } else {
      res.redirect("admin/login");
    }
  },

  loginPage: (req, res) => {
    if (req.session.admin) {
      res.redirect("/admin");
    } else {
      res.render("admin/login", { adLogErr: false });
    }
  },

  loginPost: (req, res) => {
    adminHelper.adminLogin(req.body).then((response) => {
      let admin = response.status;
      if (admin) {
        req.session.loggedInad = true;

        req.session.admin = response.validAdmin;
        // if (req.body.Remember) {
        //   req.session.cookie.maxAge = 600000;
        // } else {
        //   req.session.cookie.maxAge = 60000;
        // }

        res.redirect("/admin/dashboard");
      } else {
        res.render("admin/login", { adLogErr: true });
      }
    });
  },

  viewUser: (req, res) => {
    if (req.admin) {
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
    // Destroy the session
    // req.session.loggedInad = false;
    // res.redirect("/admin");

    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/admin");
      }
    });
  },

  blockUser: async (req, res) => {
    if (req.admin) {
      let userId = req.params.id;
      console.log(userId);
      try {
        await adminHelper.blockUser(userId);
        res.json({ status: "success" });
      } catch (error) {
        console.error(error);
      }
    }
  },

  unblockUser: async (req, res) => {
    if (req.admin) {
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
    if (req.admin) {
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

  editCategory: async (req, res) => {
    const { category: categoryName } = req.body;
    const id = req.params.id;

    try {
      await adminHelper.editCategory(categoryName, id);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
    }
  },

  deleteCategory: async (req, res) => {
    let categoryId = req.params.id;

    try {
      await adminHelper.delete(categoryId);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      res.json({ status: "error" });
    }
  },

  listCategory: async (req, res) => {
    let categoryId = req.params.id;

    try {
      await adminHelper.list(categoryId);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      res.json({ status: "error" });
    }
  },

  getAllProducts: async (req, res) => {
    if (req.admin) {
      try {
        var products = await adminHelper.getAllProducts();
      } catch (err) {
        console.error(err);
      }

      res.render("admin/products", {
        products,
      });
    } else {
      res.redirect("/admin");
    }
  },

  addProducts: async (req, res) => {
    if (req.admin) {
      try {
        var availCategory = await adminHelper.getAllCategory();
      } catch (err) {
        console.error(err);
      }
      let productFound;
      req.session.productFound ? productFound : !productFound;
      const productUploaded = req.session.productUploaded;
      const productUploadedErr = req.session.productUploadedErr;
      res.render("admin/add-products", {
        availCategory,
        productFound,
        productUploaded,
        productUploadedErr,
      });
    } else {
      res.redirect("/admin");
    }
  },

  adProductsPost: async (req, res) => {
    try {
      const files = req.files;
      const results = await Promise.all(
        files.map((file) => cloudinary.uploader.upload(file.path))
      );
      const productData = req.body;

      //convertion part color code to color name
      const colorCode = productData.productColor;
      const rgb = convert.hex.rgb(colorCode);
      const colorName = convert.rgb.keyword(rgb);
      productData.productColor = colorName;

      const productImages = results.map((file) => {
        return file.secure_url;
      });

      productData.productImages = productImages;
      productData.productStatus = "Listed";
      try {
        const productFound = await adminHelper.addProducts(productData);
        if (productFound) {
          req.session.productUploaded = true;
          res.redirect("/admin/add-products");
          return;
        }
        req.session.productFound = true;
        res.redirect("/admin/add-products");
      } catch (err) {
        console.error(err);
      }
    } catch (err) {
      console.error(err);
      req.session.productUploadErr = true;

      res.redirect("/admin/add-products");
    }
  },

  editProduct: async (req, res) => {
    let product;
    try {
      product = await adminHelper.getProductDetails(req.params.id);
    } catch (err) {
      console.error(err);
    }
    if (req.session.loggedInad) {
      res.render("admin/edit-product", { product, productUpdated: false });
    } else {
      res.redirect("/admin");
    }
  },

  editProductPost: async (req, res) => {
    try {
      const files = req.files;
      const results = await Promise.all(
        files.map((file) => cloudinary.uploader.upload(file.path))
      );

      const productData = req.body;

      //convertion part color code to color name
      const colorCode = productData.productColor;
      const rgb = convert.hex.rgb(colorCode);
      const colorName = convert.rgb.keyword(rgb);
      productData.productColor = colorName;

      if (results) {
        const productImages = results.map((file) => {
          return file.secure_url;
        });
        productData.productImages = productImages;
      }
      await adminHelper.updateProducts(productData, req.params.id);
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
      req.session.productUploadError = true;

      res.redirect("/admin/edit-product");
    }
  },

  addBanner: async (req, res) => {
    if (req.session.loggedInad) {
      try {
        var availCategory = await adminHelper.getAllCategory();
        res.render("admin/addBanner", {
          availCategory,
          productUploaded: false,
        });
      } catch (err) {
        console.error(err);
      }
    } else {
      res.redirect("/admin");
    }
  },

  addBannerPost: async (req, res) => {
    try {
      const { path } = req.file;
      const result = await cloudinary.uploader.upload(path);

      const bannerData = req.body;

      if (result) {
        const Image = result.secure_url;
        bannerData.Image = Image;
      }
      await adminHelper.addBanner(bannerData);
      res.redirect("/admin/banner-list");
    } catch (err) {
      console.error(err);
      req.session.productUploadError = true;

      res.redirect("/admin/edit-product");
    }
  },
  viewBanner: async (req, res) => {
    try {
      const banners = await adminHelper.getAllBanner();
      res.render("admin/banner-list", { banners });
    } catch (err) {
      console.error(err);
    }
  },

  removeBanner: async (req, res) => {
    try {
      await adminHelper.removeBanner(req.params.id);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
    }
  },
  ListBanner: async (req, res) => {
    try {
      await adminHelper.listBanner(req.params.id);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
    }
  },
  unlistProduct: async (req, res) => {
    try {
      await adminHelper.unlistProduct(req.params.id);
      res.redirect("/admin/products");
    } catch (err) {
      console.error(err);
    }
  },

  orderDetails: async (req, res) => {
    try {
      const Orders = await adminHelper.getOrderDetails();
      if (Orders) {
        const orders = Orders.reverse();
        console.log(orders);
        res.render("admin/order-management", { orders });
      }
    } catch (err) {
      console.error(err);
    }
  },

  viewOrder: async (req, res) => {
    try {
      const SpecificOrder = await adminHelper.getSpecificOrder(req.params.id);
      if (SpecificOrder) {
        const { order, productDetails } = SpecificOrder;

        res.render("admin/order-details", { order, productDetails });
      }
    } catch (err) {
      console.error(err);
    }
  },
  updateOrderStatus: async (req, res) => {
    try {
      const valid = await adminHelper.updateOrderStatus(
        req.body.orderId,
        req.body.status
      );
      if (!valid) {
        return res.json({ error: "error" });
      }
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
    }
  },

  addCoupon: async (req, res) => {
    try {
      console.log(req.body);
      res.render("admin/add-coupons");
    } catch (err) {
      console.error(err);
    }
  },

  addCouponPost: async (req, res) => {
    try {
      await adminHelper.generateCoupon(req.body);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      res.json({ status: "error" });
    }
  },
  removeCoupon: async (req, res) => {
    try {
      await adminHelper.removeCoupon(req.body.id);
      res.json({ status: "success" });
    } catch (err) {
      console.error(err);
      res.json({ status: "error" });
    }
  },

  viewCoupon: async (req, res) => {
    try {
      const coupons = await adminHelper.getCoupons();
      res.render("admin/view-coupons", { coupons });
    } catch (err) {
      console.error(err);
    }
  },

  viewReport: async (req, res) => {
    try {
      const orders = await adminHelper.getReportDetails();

      res.render("admin/view-salesreport", { orders });
    } catch (err) {
      console.error(err);
    }
  },

  viewReportByDate: async (req, res) => {
    try {
      const { startDate, endDate } = req.body;
      console.log(req.body);
      const orders = await adminHelper.getReport(startDate, endDate);

      res.render("admin/view-salesreport", { orders });
    } catch (err) {
      console.error(err);
    }
  },
};
