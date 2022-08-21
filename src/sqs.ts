import * as AWS from "aws-sdk";
import config from "config";

export type SqsMessageBody = {
  message: string;
  url: string;
};

const sqsClient = new AWS.SQS({
  endpoint: config.get("sqs.endpoint"),
  credentials: {
    accessKeyId: config.get("sqs.credentials.accessKeyId"),
    secretAccessKey: config.get("sqs.credentials.secretAccessKey"),
  },
  region: config.get("sqs.region"),
  maxRetries: config.get("sqs.maxRetries"),
});

export async function createAndQueueSQSMessage(
  message: string,
  url: string
): Promise<void> {
  await sqsClient.sendMessage(createSqsMessage(message, url)).promise();
}

export function createSqsMessage(message: string, url: string) {
  return {
    MessageBody: JSON.stringify({
      message,
      url,
    } as SqsMessageBody),
    QueueUrl: config.get("sqs.queue.url"),
  };
}

export async function deleteMessage(receiptHandle: string): Promise<void> {
  await sqsClient
    .deleteMessage({
      QueueUrl: config.get("sqs.queue.url"),
      ReceiptHandle: receiptHandle,
    })
    .promise();
}

export async function changeMessageVisibility(
  receiptHandle: string,
  visibilityTimeout: number
): Promise<void> {
  await sqsClient
    .changeMessageVisibility({
      QueueUrl: config.get("sqs.queue.url"),
      ReceiptHandle: receiptHandle,
      VisibilityTimeout: visibilityTimeout,
    })
    .promise();
}

export async function receiveMessage(): Promise<AWS.SQS.ReceiveMessageResult> {
  return sqsClient
    .receiveMessage({
      QueueUrl: config.get("sqs.queue.url"),
      AttributeNames: ["ApproximateReceiveCount"],
    })
    .promise();
}
