require("dotenv").config();
const accountSid = process.env.accountSid;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifySid = process.env.verifySid;
const client = require("twilio")(accountSid, authToken);

module.exports = {
  client,

  verifySid,

  generateOTP: async (mobNumber, channel) => {
    return client.verify.v2
      .services(verifySid)
      .verifications.create({ to: `+91${mobNumber}`, channel: channel });
  },
};
