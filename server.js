const express = require("express");

const server = express();

server.get("/api", (req, res) =>
  res.json({
    message: "Welcome to the time-based one time password (TOTP) API",
  })
);

module.exports = server;
