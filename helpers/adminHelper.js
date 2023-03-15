const User = require("../models/user");

const CryptoJS = require("crypto-js");

module.exports = {
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
          console.log("Login Success");
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
  getAllUsers: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let users = await User.find({});
        resolve(users);
      } catch (err) {
        console.error(err);
      }
    });
  },
};
