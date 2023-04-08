import mongoose from "mongoose";
import User from "../models/user.js";
import CryptoJS from "crypto-js";
import Token from "../models/token.js";
import crypto from "crypto";
import Product from "../models/product.js";
import Category from "../models/category.js";
import Cart from "../models/cart.js";
import product from "../models/product.js";
import { Order, Address, OrderItem } from "../models/order.js";
import { error } from "console";

export default {
  doSignUp: (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        var oldUser = await User.findOne({ email: body.registerEmail });
        if (oldUser) {
          // If an existing user is found, return an object with status=true
          resolve({ status: true });
        } else {
          // Otherwise, create a new user, save it to the database, and return an object with status=false and the saved user object
          const newUser = new User({
            username: body.registerName,
            email: body.registerEmail,
            mobnumber: body.registerMobileno,
            password: CryptoJS.AES.encrypt(
              body.registerPassword,
              process.env.Secret_PassPhrase
            ).toString(),
          });
          var savedUser = await newUser.save();

          //token creation at database
          const token = await new Token({
            userId: savedUser._id,
            token: crypto.randomBytes(32).toString("hex"),
          }).save();

          resolve({ status: false, user: savedUser, newToken: token });
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },

  doLogin: (user) => {
    return new Promise(async (resolve, reject) => {
      try {
        var validUser = await User.findOne({ email: user.loginEmail });
        if (validUser) {
          if (validUser.status) {
            const hashedPassword = CryptoJS.AES.decrypt(
              validUser.password,
              process.env.Secret_PassPhrase
            ).toString(CryptoJS.enc.Utf8);
            console.log(hashedPassword);
            console.log(user.loginPassword);
            if (hashedPassword === user.loginPassword) {
              resolve({ status: true, user: validUser });
            } else {
              console.log("Login Failed");
              resolve({ status: false });
            }
          }
        } else {
          console.log("No User Found!");
          resolve({ status: false });
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  getMobileNumber: async (mobNumber) => {
    try {
      const user = await User.findOne({ mobnumber: mobNumber });
      if (user.status) {
        return user;
      } else {
        return user.status;
      }
    } catch (err) {
      console.log(err);
    }
  },
  findUser: async (id) => {
    return await User.findById(id);
  },
  findToken: async (user, token) => {
    const newToken = await Token.findOne({
      userId: user._id,
      token: token,
    });

    if (!newToken) {
      return { status: false };
    }

    await User.findByIdAndUpdate(
      user._id,
      {
        emailVerified: true,
      },
      { new: true }
    );

    await Token.deleteOne({
      userId: user._id,
      token: token,
    });
    return;
  },
  getUser: async (mob) => {
    try {
      const user = await User.findOne({ mobnumber: mob });
      if (user && user.status) {
        return user;
      }
      return false;
    } catch (err) {
      console.log(err);
    }
  },
  updatePassword: async (id, newPassword) => {
    try {
      await User.findByIdAndUpdate(
        id,
        {
          password: CryptoJS.AES.encrypt(
            newPassword,
            process.env.Secret_PassPhrase
          ).toString(),
        },
        { new: true }
      );
    } catch (err) {
      console.error(err);
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
  getAllProducts: async (userId) => {
    try {
      const products = await Product.find({
        productStatus: "Listed",
      }).populate("category");

      const categories = await Category.find({ isListed: true });

      const cartCount = await Cart.findById(userId);
      console.log(cartCount);

      return { products, categories };
    } catch (err) {
      console.error(err);
    }
  },
  getAllProductsForList: async (categoryId) => {
    try {
      const productsQuery = Product.find({ category: categoryId }).populate(
        "category"
      );

      const products = await productsQuery.exec();

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
  getCartProducts: async (userId) => {
    try {
      const cart = await Cart.findOne({ user: userId }).populate(
        "products.productId"
      );
      if (!cart || cart.products.length <= 0) {
        return null;
      }
      const cartItems = cart.products.map((item) => {
        const { productId, quantity } = item;
        const { _id, productName, productModel, productPrice, productImage } =
          productId;
        const totalPrice = productPrice * quantity;
        return {
          item: _id,
          quantity,
          totalPrice,
          product: {
            _id,
            productName,
            productModel,
            productPrice,
            productImage,
          },
        };
      });
      let subtotal = 0;
      cartItems.forEach((item) => {
        subtotal += item.product.productPrice * item.quantity;
      });
      let cartCount = 0;

      return { cartItems, subtotal };
    } catch (err) {
      console.error(err);
      throw new Error("Error getting cart products");
    }
  },

  addToCart: async (productId, userId) => {
    const isProductExist = await Cart.findOne({
      user: userId,
      "products.productId": productId,
    });

    if (isProductExist) {
      await Cart.updateOne(
        { user: userId, "products.productId": productId },
        { $inc: { "products.$.quantity": 1 } }
      );
    } else {
      await Cart.updateOne(
        { user: userId },
        { $push: { products: { productId, quantity: 1 } } },
        { upsert: true }
      );
    }
  },

  updateQuantity: async (userId, productId, count) => {
    try {
      const cart = await Cart.findOne({ user: userId });
      const product = cart.products.find(
        (p) => p.productId.toString() === productId
      );
      if (product.quantity === 1 && parseInt(count) === -1) {
        // await cart.products.id(product._id).delete();
        // await cart.save();
        await Cart.findOneAndUpdate(
          { user: userId },
          { $pull: { products: { productId: productId } } },
          { new: true }
        );
      } else {
        cart.products.id(product._id).quantity += parseInt(count);
        await cart.save();
      }
    } catch (err) {
      console.error(err);
    }
  },
  removeProdctFromCart: async ({ cart, product }) => {
    try {
      const updatedCart = await Cart.findOneAndUpdate(
        { user: cart },
        { $pull: { products: { productId: product } } },
        { new: true }
      );
      if (!updatedCart) {
        throw new Error("Cart not found");
      }

      console.log(`Product ${product} removed from cart ${cart}`);
      return;
    } catch (error) {
      console.error(error.message);
    }
  },
  getCartCount: async (userId) => {
    try {
      const cartCount = await Cart.findOne({ user: userId });
      const productCount = cartCount?.products.length;
      return productCount;
    } catch (err) {
      console.error(err);
    }
  },
  getAddress: async (userId) => {
    try {
      const isAddressExit = await Address.find({
        user_id: userId,
      }).sort({ default_address: -1 });
      if (isAddressExit) {
        return isAddressExit;
      }
      return null;
    } catch (err) {
      console.error(err);
    }
  },

  getDefaultAddress: async (userId) => {
    try {
      const address = await Address.find({ user_id: userId });

      return address.find((item) => {
        return item.default_address == true;
      });
    } catch (err) {
      console.error(err);
    }
  },

  addAddressPost: async (userId, address) => {
    try {
      const newAddress = new Address({
        full_name: address.name,
        street_name: address.Streetaddress,
        apartment_number: address.appartments,
        city: address.city,
        state: address.state,
        postal_code: address.postalcode,
        mobile_Number: address.mobileNumber,
        user_id: userId,
      });

      await newAddress.save();
    } catch (err) {
      console.error(err);
    }
  },

  updateAddress: async (id, userId) => {
    try {
      await Address.updateMany(
        { user_id: userId },
        { default_address: false },
        { upsert: true, new: true }
      );
      await Address.findByIdAndUpdate(
        id,
        { default_address: true },
        { new: true }
      );
    } catch (err) {
      console.error(err);
    }
  },

  deleteAddress: async (id) => {
    try {
      const deletedAddress = await Address.findByIdAndDelete(id);
      return deletedAddress;
    } catch (err) {
      console.log(err);
    }
  },

  placeOrder: async (userId, PaymentMethod, address) => {
    try {
      let id = address.addressId;

      const isAddressExist = await Address.findById(id);

      if (isAddressExist) {
        isAddressExist.full_name = address.name;
        isAddressExist.street_name = address.Streetaddress;
        isAddressExist.apartment_number = address.appartments;
        isAddressExist.city = address.city;
        isAddressExist.state = address.state;
        isAddressExist.postal_code = address.postalcode;
        isAddressExist.mobile_Number = address.mobileNumber;

        await isAddressExist.save();
      }

      const cart = await Cart.findOne({ user: userId }).populate(
        "products.productId"
      );

      const cartItems = cart.products.map((item) => {
        const { productId, quantity } = item;
        const { _id, productName, productModel, productPrice, productImage } =
          productId;
        const totalPrice = productPrice * quantity;
        return {
          item: _id,
          quantity,
          totalPrice,
          product: {
            _id,
            productName,
            productModel,
            productPrice,
            productImage,
          },
        };
      });

      let subtotal = 0;
      cartItems.forEach((item) => {
        subtotal += item.product.productPrice * item.quantity;
      });

      // Create a new order

      let status =
        address.paymentMethod === "cash_on_delivery"
          ? "Placed"
          : "Payment Pending";

      console.log(status);

      const newOrder = new Order({
        user_id: userId,
        total_amount: subtotal,
        address: id,
        payment_method: PaymentMethod,
        order_status: status,
        items: [],
      });

      const orderedItems = await Promise.all(
        cartItems.map(async (item) => {
          const orderedItem = new OrderItem({
            product_id: item.product._id,
            quantity: item.quantity,
            unit_price: item.totalPrice,
          });
          return orderedItem.save();
        })
      );

      newOrder.items = newOrder.items.concat(orderedItems);

      // Save the new order to the database
      const savedOrder = await newOrder.save();

      await Cart.deleteMany({ user: userId });
      return savedOrder;
    } catch (err) {
      console.error(err);
    }
  },
  getOrderHistory: async (userId) => {
    try {
      const orders = await Order.find({ user_id: userId })
        .populate("address")
        .populate("items.product_id")
        .exec();
      if (orders.length === 0) {
        console.log("No orders found for user", userId);
      }
      return orders;
    } catch (err) {
      console.error(err);
    }
  },
  cancelOrder: async (orderId) => {
    try {
      await Order.updateOne(
        { _id: orderId },
        { $set: { order_status: "Cancelled" } }
      );

      // Retrieve updated order
      const order = await Order.findOne({ _id: orderId });

      // Retrieve user
      const userId = order.user_id;

      const user = await User.findOne({ _id: userId });

      // Update user's wallet balance (if payment method is 'onlinePayment')

      if (order.payment_method === "Paypal") {
        if (user.wallet) {
          user.wallet += order.total_amount;
        } else {
          user.wallet = order.total_amount;
        }
        await user.save(); // Save updated user object
      }
    } catch (err) {
      console.error(err);
    }
  },

  returnOrder: async (orderId) => {
    try {
      await Order.updateOne(
        { _id: orderId },
        { $set: { order_status: "Returned" } }
      );

      // Retrieve updated order
      const order = await Order.findOne({ _id: orderId });

      // Retrieve user
      const userId = order.user_id;

      const user = await User.findOne({ _id: userId });

      // Update user's wallet balance (if payment method is 'onlinePayment')
      if (user.wallet) {
        user.wallet += order.total_amount;
      } else {
        user.wallet = order.total_amount;
      }
      await user.save(); // Save updated user object
    } catch (err) {
      console.error(err);
    }
  },
};
