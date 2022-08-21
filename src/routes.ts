import { Express } from "express";
import { createAndQueueSQSMessage } from "./sqs";
import { verify } from "./verify";

export function registerRoutes(httpServer: Express): void {
  httpServer.get("/crypto/sign", async (req, res) => {
    const message = req.query.message;
    const webhookUrl = req.query.webhookUrl;

    if (typeof message !== "string" || typeof webhookUrl !== "string") {
      res
        .status(400)
        .send("Invalid input message or webhook url, must be a string");
      return;
    }

    let urlObj: URL;
    try {
      urlObj = new URL(webhookUrl);
    } catch (error) {
      res.status(400).send("Invalid webhook URL");
      return;
    }

    try {
      await createAndQueueSQSMessage(message, urlObj.href);

      res.status(202).send();
    } catch (error) {
      console.log("sign request failed unexpectedly with error:\n", error);

      res.status(500).send("Internal Server Error");
    }
  });

  httpServer.get("/crypto/verify", async (req, res) => {
    const message = req.query.message;
    const signature = req.query.signature;

    if (typeof message !== "string" || typeof signature !== "string") {
      res
        .status(400)
        .send("Invalid input message or signature, must be a string");
      return;
    }
    try {
      const valid = await verify(message, signature);

      if (valid) {
        res.status(200).send("message and signature valid");
      } else {
        res.status(400).send("message and signature invalid");
      }
    } catch (error) {
      console.log("verify request failed unexpectedly with error:\n", error);

      res.status(500).send("Internal Server Error");
    }
  });

  registerDefaultRoutes(httpServer);
}

function registerDefaultRoutes(httpServer: Express) {
  httpServer.get("*", defaultRouteHandler);

  httpServer.post("*", defaultRouteHandler);

  httpServer.put("*", defaultRouteHandler);

  httpServer.patch("*", defaultRouteHandler);

  httpServer.delete("*", defaultRouteHandler);
}

function defaultRouteHandler(_req, res) {
  res.status(405).send("Not Allowed");
}
