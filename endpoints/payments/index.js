const express = require("express");
const endpoint = express.Router();
const https = require("https");
const { logger } = require("../../startup/logger");
const _ = require("lodash");
const { verifyPaymentDetails } = require("./model");
const { User } = require("../users/model");

endpoint.post("/:userId/verify", async (req, res) => {
  if (req.params.userId !== req.body.userId)
    return res.status(400).send("User not found");
  const paymentDetails = _.pick(req.body, [
    "userId",
    "reference",
    "energyBought",
    "subscriptionPlan",
  ]);
  const { error } = verifyPaymentDetails(paymentDetails);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById({ _id: req.params.userId });
  if (!user) return res.status(400).send("User not found");

  const options = {
    hostname: "api.paystack.co",
    port: 443,
    path: `/transaction/verify/${req.body.reference}`,
    method: "GET",
    headers: {
      Authorization: `Bearer ${process.env.TRAIL_PAYSTACK_SECRET_KEY}`,
    },
  };

  https
    .request(options, (resp) => {
      let data = "";

      resp.on("data", (chunk) => {
        data += chunk;
      });

      resp.on("end", async () => {
        data = JSON.parse(data);
        if (data.status) {
          user.billingDetails.currentPlan = req.body.subscriptionPlan;
          user.billingDetails.energyBalance += req.body.energyBought;
          await user.save();
          // create a jwt, send response to client
          const token = user.generateAuthToken();
          res
            .header("x-auth-token", token)
            .header("access-control-expose-headers", "x-auth-token")
            .send({ token });
        }
      });
    })
    .end();
});

module.exports = endpoint;
