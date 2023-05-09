import User from "../models/user.js";
import CryptoJS from "crypto-js";
import Token from "../models/token.js";
import crypto from "crypto";
import Product from "../models/product.js";
import Category from "../models/category.js";
import Cart from "../models/cart.js";
import { Order, Address, OrderItem } from "../models/order.js";
import Coupon from "../models/coupon.js";
import moment from "moment";
import Wishlist from "../models/wishlist.js";
import { log } from "console";
import mongoose from "mongoose";
import Banner from "../models/banner.js";

export default {
  doSignUp: async (body) => {
    try {
      let response = {};
      const oldUser = await User.findOne({ email: body.registerEmail });
      const mobileUser = await User.findOne({
        mobnumber: body.registerMobileno,
      });
      if (oldUser || mobileUser) {
        // If an existing user is found, return an object with status=true
        response.oldUser = true;
        return response;
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
        const savedUser = await newUser.save();
        //token creation at database
        const token = await new Token({
          userId: savedUser._id,
          token: crypto.randomBytes(32).toString("hex"),
        }).save();
        response.oldUser=false,
        response.user=savedUser,
        response.newToken=token
        // { status: false, user: savedUser, newToken: token }
        return response;
      }
    } catch (err) {
      console.error(err);
      throw err;
    }
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
  getListedBanner: async () => {
    try {
      const banners = await Banner.find({ status: true }, { image: 1, _id: 0 });
      return banners;
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
  getAllProductsForList: async (categoryId, sort, userId) => {
    try {
      let sortOption = { productPrice: -1 };
      if (sort == "price-asc") {
        sortOption = { productPrice: 1 };
      }
      const productsQuery = Product.find({ category: categoryId })
        .populate("category")
        .sort(sortOption);

      const products = await productsQuery.exec();

      const cart = await Cart?.findOne({ user: userId });

      if (cart) {
        for (const product of products) {
          const isProductInCart = cart.products.some((prod) =>
            prod.productId.equals(product._id)
          );
          product.isInCart = isProductInCart; // Add a boolean flag to indicate if the product is in the cart
        }
      }

      return products;
    } catch (err) {
      console.error(err);
    }
  },

  getProductDetails: async (slug, userId) => {
    try {
      const product = await Product.findOne({ slug: slug });

      if (!product) {
        throw new Error("Product not found"); // Handle case where product does not exist
      }

      const cart = await Cart.findOne({
        user: userId,
        "products.productId": product._id,
      });

      if (cart) {
        product.isInCart = true; // Add a boolean flag to indicate if the product is in the cart
      } else {
        product.isInCart = false; // Add a boolean flag to indicate if the product is in the cart
      }

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

      return { cartItems, subtotal };
    } catch (err) {
      console.error(err);
      throw new Error("Error getting cart products");
    }
  },

  getCheckoutProducts: async (userId) => {
    try {
      const cart = await Cart.findOne({ user: userId }).populate(
        "products.productId"
      );
      if (!cart || cart.products.length <= 0) {
        return null;
      }
      let isAllProductsInStock = true;
      const cartItems = cart.products.map((item) => {
        const { productId, quantity } = item;
        const {
          _id,
          productName,
          productModel,
          productPrice,
          productImage,
          productQuantity: stock,
        } = productId;
        const totalPrice = productPrice * quantity;

        if (quantity > stock) {
          isAllProductsInStock = false;
        }
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
      if (!isAllProductsInStock) {
        return false;
      }

      return { cartItems, subtotal };
    } catch (err) {
      console.error(err);
      throw new Error("Error getting cart products");
    }
  },

  addToCart: async (productId, userId) => {
    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const quantity = product.productQuantity;

    if (quantity <= 0) {
      return false;
    }

    await Cart.updateOne(
      { user: userId },
      { $push: { products: { productId, quantity: 1 } } },
      { upsert: true }
    );

    // Update product quantity in the database
    // await Product.findByIdAndUpdate(productId, {
    //   $inc: { productQuantity: -1 },
    // });
    return true;
  },
  addToCartFromWish: async (productId, userId) => {
    // Find product
    const product = await Product.findById(productId);

    if (!product) {
      throw new Error("Product not found");
    }

    const quantity = product.productQuantity;

    if (quantity <= 0) {
      return false;
    }

    await Cart.updateOne(
      { user: userId },
      { $push: { products: { productId, quantity: 1 } } },
      { upsert: true }
    ).then(() => {
      return Wishlist.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: productId } } },
        { new: true }
      );
    });
    return true;
  },

  updateQuantity: async (userId, productId, count) => {
    try {
      const cart = await Cart.findOne({ user: userId });
      const product = cart.products.find(
        (p) => p.productId.toString() === productId
      );
      if (!product) {
        throw new Error("Product not found in cart");
      }
      // Calculate new quantity
      const newQuantity = product.quantity + parseInt(count);

      if (newQuantity < 0) {
        return false;
      }

      // Update product quantity in the database
      const productToUpdate = await Product.findById(productId);
      const updatedProductQuantity =
        count === "1"
          ? productToUpdate.productQuantity - 1
          : productToUpdate.productQuantity + 1;

      if (updatedProductQuantity < 0) {
        return false;
      }

      if (newQuantity === 0) {
        // If new quantity is 0, remove product from cart
        await Cart.findOneAndUpdate(
          { user: userId },
          { $pull: { products: { productId: productId } } },
          { new: true }
        );
      } else {
        // Otherwise, update product quantity in cart and save cart
        cart.products.id(product._id).quantity = newQuantity;
        await cart.save();
      }

      // await Product.findByIdAndUpdate(productId, {
      //   $set: { productQuantity: updatedProductQuantity },
      // });

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  removeProductFromCart: async ({ cart, product }) => {
    try {
      const cartDoc = await Cart.findOne({ user: cart }); // Find the cart document
      if (!cartDoc) {
        throw new Error("Cart not found");
      }
      // Find the product document
      const productDoc = await Product.findById(product);
      console.log(productDoc);
      if (!productDoc) {
        throw new Error("Product not found");
      }

      // // Find the index of the product in the cart
      const productIndex = cartDoc.products.findIndex(
        (p) => p.productId.toString() === product
      );
      // console.log(productIndex);

      if (productIndex === -1) {
        throw new Error("Product not found in cart");
      }
      // Remove the product from the cart
      cartDoc.products.splice(productIndex, 1);
      await cartDoc.save();
      return;
    } catch (err) {
      console.error(err);
    }
  },
  removeProdctFromWishLIst: async (userId, productId) => {
    try {
      const response = await Wishlist.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: productId } } },
        { new: true }
      );

      return;
    } catch (err) {
      console.error(err);
    }
  },

  getCartCount: async (userId) => {
    try {
      const cartCount = await Cart.findOne({ user: userId });
      const productCount = cartCount?.products.length;
      if (!productCount) return 0;

      return productCount;
    } catch (err) {
      console.error(err);
    }
  },

  countWish: async (userId) => {
    try {
      const wishCount = await Wishlist.findOne({ userId: userId });
      const productCount = wishCount?.items.length;
      if (!productCount) return 0;
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

  placeOrder: async (
    userId,
    PaymentMethod,
    totalAmount,
    couponCode,
    address
  ) => {
    try {
      let id = address?.addressId;

      if (id) {
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
      }
      //create new  address
      else {
        const newAddress = new Address({
          user_id: userId,
          full_name: address.name,
          street_name: address.Streetaddress,
          apartment_number: address.appartments,
          city: address.city,
          state: address.state,
          postal_code: address.postalcode,
          mobile_Number: address.mobileNumber,
          default_address: true,
        });

        const response = await newAddress.save();

        id = response._id;
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

      //extracting totalamount
      let subtotal = 0;
      if (isNaN(totalAmount)) {
        cartItems.forEach((item) => {
          subtotal += item.product.productPrice * item.quantity;
        });
      } else {
        subtotal = totalAmount;
        const coupon = await Coupon.findOne({ code: couponCode });
        if (coupon) {
          coupon.usedBy.push(userId);
          await coupon.save();
        }
      }

      // Create a new order

      let status = "";
      if (PaymentMethod === "cash_on_delivery") {
        status = "Placed";
      } else if (PaymentMethod === "wallet") {
        const user = await User.findById(userId);

        if (user.wallet >= subtotal) {
          user.wallet -= parseInt(subtotal);
          await user.save();
          status = "Placed";
          var paymentStatus = "paid";
        } else {
          status = "Payment Pending";
        }
      } else if (PaymentMethod == "online_payment") {
        status = "Payment Pending";
        const newOrder = new Order({
          user_id: userId,
          total_amount: subtotal,
          address: id,
          payment_method: PaymentMethod,
          payment_status: paymentStatus,
          order_status: status,
          items: [],
        });

        const orderedItems = await Promise.all(
          cartItems.map(async (item) => {
            const orderedItem = new OrderItem({
              productName: item.product.productName,
              product_id: item.product._id,
              quantity: item.quantity,
              unit_price: item.totalPrice,
            });
            await orderedItem.save();
            return orderedItem;
          })
        );

        newOrder.items = newOrder.items.concat(orderedItems);

        // Save the new order to the database
        const savedOrder = await newOrder.save();
        return savedOrder;
      }

      const newOrder = new Order({
        user_id: userId,
        total_amount: subtotal,
        address: id,
        payment_method: PaymentMethod,
        payment_status: paymentStatus,
        order_status: status,
        items: [],
      });

      const orderedItems = await Promise.all(
        cartItems.map(async (item) => {
          const orderedItem = new OrderItem({
            productName: item.product.productName,
            product_id: item.product._id,
            quantity: item.quantity,
            unit_price: item.totalPrice,
          });
          await orderedItem.save();

          // Update product quantity in product collection
          const product = await Product.findById(item.product._id);
          if (product) {
            // Subtract ordered quantity from product quantity
            product.productQuantity -= item.quantity;
            await product.save();
          }

          return orderedItem;
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

  changeOnlinePaymentStatus: async (orderId, userId) => {
    try {
      const order = await Order.findById(orderId);
      const orderItems = order?.items;
      await Promise.all(
        orderItems.map(async (item) => {
          const product = await Product.findById(item.product_id);
          if (product) {
            // Add returned quantity to product quantity
            product.productQuantity -= item.quantity;
            await product.save();
          }
        })
      );
      await Order.findByIdAndUpdate(
        orderId,
        {
          payment_status: "paid",
          order_status: "Placed",
        },
        {
          new: true,
        }
      );
      await Cart.deleteMany({ user: userId });
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

      if (order.payment_method === "online_payment") {
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

  returnOrder: async (orderId, reason) => {
    try {
      await Order.updateMany(
        { _id: orderId },
        {
          $set: {
            order_status: "Returned",
            return_status: "pending",
            return_reason: reason,
          },
        }
      );
    } catch (err) {
      console.error(err);
    }
  },
  getCoupons: async (userId) => {
    try {
      const coupons = await Coupon.find();
      const unusedCouponsWithDaysRemaining = coupons
        .filter((coupon) => !coupon.usedBy.includes(userId)) // Filter out coupons with usedBy field
        .map((coupon) => {
          const current_date = moment();
          const expiration_date = moment(coupon.expirationDate);
          coupon.days_remaining = expiration_date.diff(current_date, "days");
          return coupon;
        });
      return unusedCouponsWithDaysRemaining;
    } catch (err) {
      console.error(err);
    }
  },
  applyCoupon: async (couponCode, totalAmount, userId) => {
    try {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (coupon) {
        if (coupon.usedBy.includes(userId)) {
          var discountAmount = {};
          discountAmount.status = false;
          return discountAmount;
        }

        let discount = (totalAmount / coupon.discount) * 100;
        let maxdiscount = coupon.maxdiscount;
        if (maxdiscount < discount) {
          var discountAmount = {};
          let disPrice = totalAmount - maxdiscount;
          discountAmount.couponCode = coupon.code;
          discountAmount.disAmount = maxdiscount;
          discountAmount.disPrice = disPrice;
          discountAmount.status = true;
          return discountAmount;
        } else {
          var discountAmount = {};
          let disPrice = totalAmount - discount;
          discountAmount.couponCode = coupon.code;
          discountAmount.disAmount = maxdiscount;
          discountAmount.disPrice = disPrice;
          discountAmount.status = true;
          return discountAmount;
        }
      }
    } catch (err) {
      console.error(err);
    }
  },

  editPasswordUpdate: async (id, currentPassword, newPassword) => {
    try {
      // Find the user by id
      const user = await User.findById(id);

      if (!user) {
        // User not found
        return false;
      }

      // Decrypt the stored password and compare with the current password
      const decryptedPassword = CryptoJS.AES.decrypt(
        user.password,
        process.env.Secret_PassPhrase
      ).toString(CryptoJS.enc.Utf8);

      if (decryptedPassword !== currentPassword) {
        // Current password does not match
        return false;
      }

      // Encrypt and update the new password
      user.password = CryptoJS.AES.encrypt(
        newPassword,
        process.env.Secret_PassPhrase
      ).toString();
      await user.save();

      return user; // Return the updated user object
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  searchQuery: async (query, userId) => {
    try {
      const products = await Product.find({
        $or: [
          { productName: { $regex: query, $options: "i" } },
          { productModel: { $regex: query, $options: "i" } },
          { productDescription: { $regex: query, $options: "i" } },
        ],
      }).populate("category");
      if (products.length > 0) {
        const cart = await Cart?.findOne({ user: userId });

        if (cart) {
          for (const product of products) {
            const isProductInCart = cart.products.some((prod) =>
              prod.productId.equals(product._id)
            );
            product.isInCart = isProductInCart; // Add a boolean flag to indicate if the product is in the cart
          }
        }
        return products;
      }
      return [];
    } catch (err) {
      console.error(err);
    }
  },
  sortQuery: async (sort, userId) => {
    try {
      let sortOption = { productPrice: -1 }; // Default sort by productPrice in ascending order

      if (sort === "price-desc") {
        sortOption = { productPrice: 1 }; // Sort by productPrice in descending order
      }

      const products = await Product.find({})
        .populate("category")
        .sort(sortOption);
      if (products.length > 0) {
        const cart = await Cart?.findOne({ user: userId });

        if (cart) {
          for (const product of products) {
            const isProductInCart = cart.products.some((prod) =>
              prod.productId.equals(product._id)
            );
            product.isInCart = isProductInCart; // Add a boolean flag to indicate if the product is in the cart
          }
        }
        return products;
      }
      return null;
    } catch (err) {
      console.error(err);
    }
  },
  addToWishListUpdate: async (userId, productId) => {
    try {
      const wishlistDoc = await Wishlist.findOne({ userId: userId });
      if (!wishlistDoc) {
        // If wishlist doesn't exist for user, create a new one
        const newWishlist = new Wishlist({
          userId: userId,
          items: [
            {
              productId: productId,
              addedAt: new Date(),
            },
          ],
        });
        await newWishlist.save();
      } else {
        // Check if the product is already present in the wishlist
        const productIndex = wishlistDoc.items.findIndex(
          (item) => item.productId.toString() === productId
        );

        if (productIndex !== -1) {
          // If the product is already present, remove it and return 'removed' status
          await Wishlist.findOneAndUpdate(
            { userId: userId },
            { $pull: { items: { productId: productId } } },
            { new: true }
          );
          return "removed";
        }

        // If the product is not already present, add it to the wishlist
        wishlistDoc.items.push({
          productId: productId,
          addedAt: new Date(),
        });
        await wishlistDoc.save();
      }
    } catch (err) {
      console.error(err);
    }
  },

  showWishlist: async (userId) => {
    try {
      const wishlistDoc = await Wishlist.findOne({ userId: userId }).populate({
        path: "items.productId",
        select:
          "productName productModel productPrice productQuantity productImage _id",
        populate: {
          path: "category",
          select: "categoryName _id",
        },
      });
      if (!wishlistDoc) {
        // If wishlist doesn't exist for user, return an empty array
        return [];
      } else {
        // If wishlist exists, return the items array with product details
        return wishlistDoc.items;
      }
    } catch (err) {
      console.error(err);
      return [];
    }
  },
  updataUserProfile: async (user_id, Name, gender, Email, Number) => {
    try {
      const user = await User.findByIdAndUpdate(user_id, {
        username: Name,
        mobnumber: Number,
        email: Email,
      });
      return user;
    } catch (err) {
      console.error(err);
    }
  },
};
