const express = require("express");
const HTTPError = require("../util/http-error");
// Error handling middleware
const errorHandler = (error, req, res, next) => {
  let message, status, err;
  err = error;
  if (error instanceof HTTPError) {
    {
      message = error.message;
      status = error.status;
      err = error.err;
    }
  }

  if (message) {
    res.status(status || 500).json({ error: message });
  } else {
    res.status(500).json({ error: "Internal Server Error" });
  }
  // Check the error type and send appropriate response
  if (err && err.name === "ValidationError") {
    // Validation error
    console.error("Validation error:", err);
  } else if (err && err.name === "JsonWebTokenError") {
    // JWT error
    console.error("JWT error:", err);
  } else if (err && err.name === "CastError") {
    // MongoDB error
    console.error("MongoDB error:", err);
    if (err.kind === "ObjectId") {
      console.error("Invalid ObjectId:", err.value);
    } else {
      console.error("Unknown MongoDB error:", err);
    }
  } else if (
    err instanceof SyntaxError &&
    err.status === 400 &&
    "body" in err
  ) {
    // Bad JSON
    return res.status(400).json({ error: "Invalid JSON payload" });
  } else {
    // Unknown error
    console.error("Unknown error:", err);
  }
};

module.exports = errorHandler;
