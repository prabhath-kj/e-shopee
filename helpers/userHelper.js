const User = require("../models/user");
const CryptoJS = require("crypto-js");
const Token = require("../models/token");
const crypto = require("crypto");
const user = require("../models/user");

module.exports = {
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
};
