const express = require("express");
const speakeasy = require("speakeasy");
const uuid = require("uuid");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");

const server = express();
server.use(express.json());

// true argument will make push command also save to db
const db = new JsonDB(new Config("totp", true, false, "/"));

server.get("/v1/", (req, res) =>
  res.json({
    message: "Welcome to the time-based one time password (TOTP) API",
  })
);

// Register user and create secret
server.get("/v1/users/register", (req, res) => {
  const id = uuid.v4();

  // speakeasy provides ascii, hex, base32 and otpauth_url (QR-code for frontned) but we only return base32
  try {
    const path = `/user/${id}`;
    const temp_secret = speakeasy.generateSecret();
    db.push(path, { id, temp_secret });
    res.json({ id, secret: temp_secret.base32 });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal error during register." });
  }
});

// verify and persist token (initial setup)
server.post("/v1/users/verify", (req, res) => {
  const { token, userId } = req.body;

  try {
    const path = `/user/${userId}`;
    const user = db.getData(path);

    const { base32: secret } = user.temp_secret;

    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
    });

    if (verified) {
      db.push(path, { id: userId, secret: user.temp_secret });
      res.json({ verified: true });
    } else {
      res.json({ verified: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal error during verification." });
  }
});

// validate token (frequent usage time-based 1min valid code)
server.post("/v1/users/validate", (req, res) => {
  const { token, userId } = req.body;

  try {
    const path = `/user/${userId}`;
    const user = db.getData(path);

    const { base32: secret } = user.secret;

    const tokenValidates = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (tokenValidates) {
      res.json({ validated: true });
    } else {
      res.json({ validated: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal error during validation." });
  }
});

module.exports = server;
