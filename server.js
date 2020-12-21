const express = require("express");
const speakeasy = require("speakeasy");
const uuid = require("uuid");
const { JsonDB } = require("node-json-db");
const { Config } = require("node-json-db/dist/lib/JsonDBConfig");

const server = express();

// true argument will make push command also save to db
const db = new JsonDB(new Config("totp", true, false, "/"));

server.get("/api", (req, res) =>
  res.json({
    message: "Welcome to the time-based one time password (TOTP) API",
  })
);

module.exports = server;
