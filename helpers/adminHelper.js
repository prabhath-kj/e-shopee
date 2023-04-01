import User from "../models/user.js";
import Category from "../models/category.js";
import Product from "../models/product.js";

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
          console.log("Login Failed");
          resolve({ status: false });
        }
      } else {
        console.log("No Admin Found!");
        resolve({ status: false });
      }
    });
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
        CategoryName: category.CategoryName,
      });

      if (existingCategory) {
        const updatedCategory = await Category.findByIdAndUpdate(
          existingCategory._id,
          {
            CategoryName: category.CategoryName,
            CategoryDescription: category.CategoryDescription,
          },
          { new: true }
        );

        return updatedCategory;
      } else {
        // Create a new category
        const newCategory = new Category({
          CategoryName: category.CategoryName,
          CategoryDescription: category.CategoryDescription,
        });
        await newCategory.save();
        return;
      }
    } catch (error) {
      console.error("Error updating category:", error);
    }
  },

  delete: async (categoryId) => {
    try {
      await Category.findByIdAndDelete(categoryId);
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
      return true
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

          productDescription: productData.productDescription,

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
};
