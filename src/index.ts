import { registerRoutes } from "./routes";
import { createServer } from "./server";
import { pollAndProcessSqsMessage } from "./processor";

const httpServer = createServer();
registerRoutes(httpServer);

httpServer.listen(3000, function () {
  console.log("listening on 3000");
});

setInterval(pollAndProcessSqsMessage, 6000);
