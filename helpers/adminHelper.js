import User from "../models/user.js";
import Category from "../models/category.js";
import Product from "../models/product.js";
import { Order, Address, OrderItem } from "../models/order.js";
import Coupon from "../models/coupon.js";
import Banner from "../models/banner.js";
import moment from "moment/moment.js";

export default {
  adminLogin: (admindata) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      try {
        var validAdmin = await User.findOne({ email: admindata.adLogEmail });
      } catch (err) {
        console.error(err);
      }

      if (validAdmin) {
        if (validAdmin.isAdmin) {
          response.validAdmin = validAdmin;
          response.status = true;
          resolve(response);
        } else {
          resolve({ status: false });
        }
      } else {
        resolve({ status: false });
      }
    });
  },

  findTotalRevenue: async () => {
    try {
      const result = await Order.aggregate([
        {
          $match: {
            order_status: "Delivered", // Filter only delivered orders
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total_amount" }, // Calculate the sum of total_amount field
          },
        },
      ]);
      return result[0].totalRevenue;
    } catch (err) {
      console.error(err);
    }
  },

  orderStatusData: async () => {
    try {
      const orderData = await Order.aggregate([
        {
          $group: {
            _id: "$order_status",
            count: { $sum: 1 },
          },
        },
      ]);
      const counts = {};
      for (const order of orderData) {
        counts[order._id] = order.count;
      }

      return counts;
    } catch (err) {
      console.log(err);
    }
  },

  paymentStatitics: async () => {
    try {
      const paymentData = await Order.aggregate([
        {
          $group: {
            _id: "$payment_method",
            count: { $sum: 1 },
          },
        },
      ]);
      const counts = {};
      for (const payment of paymentData) {
        counts[payment._id] = payment.count;
      }

      return counts;
    } catch (err) {
      console.log(err);
    }
  },

  getAllUsers: (status) => {
    return new Promise(async (resolve, reject) => {
      if (status) {
        let filter = {};
        status === "active"
          ? (filter.status = true)
          : status === "inactive"
          ? (filter.status = false)
          : filter;
        try {
          let users = await User.find({ status: filter.status });
          resolve(users);
        } catch (err) {
          console.error(err);
        }
      } else {
        try {
          let users = await User.find({});
          resolve(users);
        } catch (err) {
          console.error(err);
        }
      }
    });
  },
  blockUser: async (userId) => {
    try {
      const user = await User.findById(userId);
      console.log(user);
      user.status = false;
      await user.save();
      console.log(`User with ID ${userId} has been blocked`);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to block user");
    }
  },

  unblockUser: async (userId) => {
    try {
      const user = await User.findById(userId);
      user.status = true;
      await user.save();
      console.log(`User with ID ${userId} has been unblocked`);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to unblock user");
    }
  },
  getAllCategory: async () => {
    try {
      let viewCategory = await Category.find({});
      return viewCategory;
    } catch (err) {
      console.error(err);
    }
  },
  addCategory: async (category) => {
    try {
      const existingCategory = await Category.findOne({
        CategoryName: category.CategoryName.toUpperCase(),
      });

      if (existingCategory) {
        const updatedCategory = await Category.findByIdAndUpdate(
          existingCategory._id,
          {
            CategoryName: category.CategoryName.toUpperCase(),
          },
          { new: true }
        );

        return updatedCategory;
      } else {
        // Create a new category
        const newCategory = new Category({
          CategoryName: category.CategoryName.toUpperCase(),
        });
        await newCategory.save();
        return;
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  },
  editCategory: async (categoryName, id) => {
    console.log(id);
    try {
      const existingCategory = await Category.findByIdAndUpdate(
        id,
        {
          CategoryName: categoryName.toUpperCase(),
        },
        { new: true }
      );
    } catch (err) {
      console.error(err);
    }
  },

  delete: async (categoryId) => {
    try {
      await Category.findByIdAndUpdate(
        categoryId,
        {
          isListed: false,
        },
        { new: true }
      );
      return;
    } catch (err) {
      console.error(err);
    }
  },

  list: async (categoryId) => {
    try {
      await Category.findByIdAndUpdate(
        categoryId,
        {
          isListed: true,
        },
        { new: true }
      );
      return;
    } catch (err) {
      console.error(err);
    }
  },
  addProducts: async (productData) => {
    try {
      const newProducts = new Product({
        productModel: productData.productModel,

        productName: productData.productName,

        productPrice: productData.productPrice,

        productDescription: productData.productDescription,

        productQuantity: productData.productQuantity,

        productColor: productData.productColor,

        productImage: productData.productImages,

        productStatus: productData.productStatus,

        category: productData.Category,
      });

      await newProducts.save();
      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
  getAllProducts: async () => {
    try {
      const products = await Product.find({});
      return products;
    } catch (err) {
      console.error(err);
    }
  },
  getProductDetails: async (proId) => {
    try {
      const product = await Product.findById(proId);
      return product;
    } catch (err) {
      console.error(err);
    }
  },

  updateProducts: async (productData, proID) => {
    let update = {};
    if (productData.productImages && productData.productImages.length > 0) {
      update.productImage = productData.productImages;
    }
    try {
      await Product.findByIdAndUpdate(
        proID,
        {
          productModel: productData.productModel,

          productName: productData.productName,

          productPrice: productData.productPrice,

          productDescription: productData.productDescription.trim(),

          productQuantity: productData.productQuantity,

          productColor: productData.productColor,

          ...update,

          productStatus: productData.productStatus,
        },
        { new: true }
      );

      return;
    } catch (err) {
      console.error(err);
    }
  },
  unlistProduct: async (proID) => {
    try {
      await Product.findByIdAndUpdate(
        proID,
        { productStatus: "Unlisted" },
        { new: true }
      );
    } catch (err) {
      console.error(err);
    }
  },

  getOrderDetails: async () => {
    try {
      const order = await Order.find({})
        .populate("address")
        .populate("items.product_id")
        .exec();
      if (order.length === 0) {
        console.log("No orders found for user");
      } else {
        return order;
      }
    } catch (err) {
      console.error(err);
    }
  },

  getSpecificOrder: async (id) => {
    try {
      const order = await Order.findById(id).populate("address").exec();
      const productDetails = [];

      for (const item of order.items) {
        const productId = item.product_id;
        const product = await Product.findOne({ _id: productId });
        productDetails.push({
          name: product.productName,
          price: item.unit_price,
          quantity: item.quantity,
          total: item.unit_price * item.quantity,
          image: product.productImage[0],
        });
      }

      return { order, productDetails };
    } catch (err) {
      console.error(err);
    }
  },

  updateOrderStatus: async (orderId, orderStatus) => {
    try {
      let order;
      if (orderStatus === "Delivered") {
        order = await Order.findById(orderId);
        if (!order) {
          throw new Error("Order not found");
        }

        order.order_status = "Delivered";
        if (order.payment_method === "cash_on_delivery") {
          order.payment_status = "paid";
        }

        // Save the updated order in the database
        const updatedOrder = await order.save();
        return updatedOrder;
      } else if (orderStatus === "approved" || orderStatus === "rejected") {
        if (orderStatus === "approved") {
          // Retrieve updated order
          order = await Order.findOneAndUpdate(
            { _id: orderId },
            {
              return_status: orderStatus,
              refund: "success",
            },
            { new: true }
          );

          // Retrieve user
          const userId = order.user_id;
          const user = await User.findOne({ _id: userId });

          if (!user) {
            throw new Error("User not found");
          }

          if (user.wallet) {
            user.wallet += order.total_amount;
          } else {
            user.wallet = order.total_amount;
          }

          // Save updated user object
          await user.save();

          // Iterate over order items
          const orderItems = order?.items;
          await Promise.all(
            orderItems.map(async (item) => {
              const product = await Product.findById(item.product_id);
              if (product) {
                // Add returned quantity to product quantity
                product.productQuantity += item.quantity;
                await product.save();
              }
            })
          );

          return order;
        } else {
          order = await Order.findOneAndUpdate(
            { _id: orderId },
            {
              return_status: orderStatus,
              refund: "failure",
            },
            { new: true }
          );
          return order;
        }
      } else {
        order = await Order.findByIdAndUpdate(
          { _id: orderId },
          {
            order_status: orderStatus,
          },
          { new: true }
        );
        if (!order) {
          throw new Error("Order not found");
        }
        return order;
      }
    } catch (err) {
      console.error(err);
      throw err; // Rethrow the error for further handling
    }
  },

  generateCoupon: async (coupon) => {
    try {
      const { couponCode, couponDiscount, expiryDate, maxDiscount } = coupon;
      const newCoupon = new Coupon({
        code: couponCode,
        discount: couponDiscount,
        maxdiscount: maxDiscount,
        expirationDate: expiryDate,
      });
      await newCoupon.save();
      return newCoupon;
    } catch (err) {
      console.error(err);
    }
  },

  removeCoupon: async (couponId) => {
    try {
      await Coupon.findByIdAndDelete(couponId);
    } catch (err) {
      console.error(err);
    }
  },

  getCoupons: async () => {
    try {
      const coupons = await Coupon.find();
      const couponsWithDaysRemaining = coupons.map((coupon) => {
        const current_date = moment();
        const expiration_date = moment(coupon.expirationDate);
        coupon.days_remaining = expiration_date.diff(current_date, "days");
        return coupon;
      });
      return couponsWithDaysRemaining;
    } catch (err) {
      console.error(err);
    }
  },

  addBanner: async (data) => {
    try {
      const newBanner = new Banner({
        headline: data.headline,
        image: data.Image,
        category: data.Category,
        additionalInfo: data.productDescription,
      });
      await newBanner.save();
    } catch (err) {
      console.error(err);
    }
  },

  getAllBanner: async () => {
    try {
      const banners = await Banner.find({}).populate("category");
      return banners;
    } catch (err) {
      console.error(err);
    }
  },

  removeBanner: async (id) => {
    try {
      const banner = await Banner.findByIdAndUpdate(
        id,
        { status: false },
        { new: true }
      );
      return banner;
    } catch (err) {
      console.error(err);
    }
  },

  listBanner: async (id) => {
    try {
      const banner = await Banner.findByIdAndUpdate(
        id,
        { status: true },
        { new: true }
      );
      return banner;
    } catch (err) {
      console.error(err);
    }
  },
  getReportDetails: async () => {
    try {
      // Query the orders collection based on the order_date field
      const query = { order_status: "Delivered" };
      const orders = await Order.find(query).populate("address");
      return orders;
    } catch (err) {
      console.error(err);
    }
  },

  getReport: async (startDate, endDate) => {
    try {
      const query = [
        {
          $match: {
            order_status: "Delivered",
          },
        },
        {
          $match: {
            $and: [
              { order_date: { $gte: new Date(startDate) } },
              { order_date: { $lte: new Date(endDate) } },
            ],
          },
        },
        {
          $sort: {
            date: -1,
          },
        },
      ];

      const orders = await Order.aggregate(query);

      return orders;
    } catch (err) {
      console.error(err);
    }
  },
};
