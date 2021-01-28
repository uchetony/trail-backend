const { auth, checkPermissionTo } = require("../../middlewares/authorisation");
const { verifyUserEmail } = require("../../email/verify");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const endpoint = express.Router();
const {
  User,
  validateUser,
  validateObjectId,
  validateBillingData,
} = require("./model");

// GET REQUESTS

// get all users
endpoint.get(
  "/stakeholders/:companyId",
  [auth, checkPermissionTo("readAny", "user")],
  async (req, res) => {
    const companyId = _.pick(req.params, ["companyId"]);
    const { error } = validateObjectId(companyId);
    if (error) return res.status(400).send("Invalid User");

    const users = await User.find({
      "billingDetails.disco.id": `${req.params.companyId}`,
    }).select(["-password", "-billingDetails.disco"]);
    res.send(users);
  }
);

// get current user
endpoint.get(
  "/myaccount",
  [auth, checkPermissionTo("readOwn", "user")],
  async (req, res) => {
    const user = await User.findById({ _id: req.user._id }).select("-password");
    if (!user) return res.status(404).send("user not found");
    res.send(user);
  }
);

// POST REQUEST

// create a user
endpoint.post("/", async (req, res) => {
  // validate client data
  const clientData = _.pick(req.body, [
    "fullName",
    "email",
    "password",
    "phoneNumber",
    "address",
    "role",
  ]);
  const { error } = validateUser(clientData);
  if (error) return res.status(400).send(error.details[0].message);

  // check if user already exists
  let user = await User.findOne(_.pick(req.body, "email"));
  if (user)
    return res.status(400).send("A user with this email already exists");

  // else set user, hash the password and save to db
  user = new User(
    _.pick(req.body, [
      "fullName",
      "email",
      "password",
      "phoneNumber",
      "address",
      "role",
    ])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  //  create a jwt, send response to client
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send({ token, ..._.pick(user, ["_id", "fullName", "email"]) });

  // send an email to user to verify their account
  await verifyUserEmail(req.body.email, req.body.fullName);
});

// verify a user email address
endpoint.post("/:userId/verify/email", async (req, res) => {
  const clientId = _.pick(req.params, ["userId"]);
  const { error } = validateObjectId(clientId);
  if (error)
    return res
      .status(400)
      .send(
        "NOT USER. Kindly verify your email with the device used in registering"
      );

  // check if user exists
  const user = await User.findById({ _id: req.params.userId });
  const isUser = await bcrypt.compare(user.email, req.body.email);
  if (!isUser)
    return res
      .status(400)
      .send("Oops! seems like this is a wrong email address");

  if (user.isVerifiedEmail)
    return res.status(400).send("This email is already verified");
  user.isVerifiedEmail = true;

  await user.save();

  // create a jwt, send response to client
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send({ token })
    .end();
});

// register billing details for a user
endpoint.post("/:userId/billing", async (req, res) => {
  if (req.params.userId !== req.body.userId)
    return res.status(400).send("User not found");
  const billingData = _.pick(req.body, [
    "userId",
    "meterId",
    "companyId",
    "companyName",
  ]);
  const { error } = validateBillingData(billingData);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findById({ _id: req.params.userId });
  if (!user) return res.status(400).send("User not found");

  user.billingDetails.meterId = req.body.meterId;
  user.billingDetails.disco.id = req.body.companyId;
  user.billingDetails.disco.name = req.body.companyName;
  user.billingDetails.energyBalance = 0;

  await user.save();

  // create a jwt, send response to client
  const token = user.generateAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send({ token })
    .end();
});

module.exports = endpoint;
