const User = require("../models/user");
const CryptoJS = require("crypto-js");

module.exports = {
  doSignUp: (body) => {
    return new Promise(async (resolve, reject) => {
      let userold = {};
      try {
        var oldUser = await User.findOne({ email: body.registerEmail });
      } catch (err) {
        console.error(err);
      }
      if (oldUser) {
        userold.status = true;
        resolve(userold);
      } else {
        const newUser = new User({
          username: body.registerName,
          email: body.registerEmail,
          mobnumber: body.registerMobileno,
          password: CryptoJS.AES.encrypt(
            body.registerPassword,
            process.env.Secret_PassPhrase
          ).toString(),
          status: true,
        });
        try {
          var savedUser = await newUser.save();
        } catch (err) {
          console.error(err);
        }
        resolve({ status: false });
        resolve(savedUser);
      }
    });
  },
  doLogin: (user) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      try {
        var validUser = await User.findOne({ email: user.loginEmail });
      } catch (err) {
        console.error(err);
      }

      if (validUser) {
        const hashedPassword = CryptoJS.AES.decrypt(
          validUser.password,
          process.env.Secret_PassPhrase
        ).toString(CryptoJS.enc.Utf8);
        console.log(hashedPassword);
        console.log(user.loginPassword);
        if (hashedPassword === user.loginPassword) {
          console.log("Login Success");
          response.validUser = validUser;
          response.status = true;
          resolve(response);
        } else {
          console.log("Login Failed");
          resolve({ status: false });
        }
      } else {
        console.log("No User Found!");
        resolve({ status: false });
      }
    });
  },
};
