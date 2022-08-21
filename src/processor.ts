import { sign } from "./sign";
import { callWebhook } from "./webhook";
import {
  changeMessageVisibility,
  deleteMessage,
  receiveMessage,
  SqsMessageBody,
} from "./sqs";

export async function pollAndProcessSqsMessage() {
  try {
    const recieveMessageResponse = await receiveMessage();

    if (!recieveMessageResponse.Messages?.length) {
      console.log("No messages in the queue");

      return;
    }

    const messageBody = JSON.parse(
      recieveMessageResponse.Messages[0].Body
    ) as SqsMessageBody;
    const receiptHandle = recieveMessageResponse.Messages[0].ReceiptHandle;
    const recieveCount = parseInt(
      recieveMessageResponse.Messages[0].Attributes.ApproximateReceiveCount
    );

    const signature = await sign(messageBody.message);

    if (signature) {
      await callWebhook(messageBody.message, signature, messageBody.url);
      await deleteMessage(receiptHandle);
    } else {
      console.log("Message signing failed. Retrying...");

      await changeMessageVisibility(
        receiptHandle,
        60 * Math.pow(2, recieveCount - 1)
      );
    }
  } catch (error) {
    console.log("message processing failed with error:\n", error);
  }
}
