const express = require("express");
const speakeasy = require("speakeasy");
const uuid = require("uuid");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");

const server = express();

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
    res.status(500).json({ message: "Interal eror during register." });
  }
});

module.exports = server;
