import express = require("express");

export function createServer(): express.Express {
  const httpServer = express();

  httpServer.use(
    express.urlencoded({
      extended: true,
    })
  );

  return httpServer;
}
