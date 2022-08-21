import axios from "axios";

export async function callWebhook(
  message: string,
  signature: string,
  url: string
): Promise<void> {
  try {
    await axios.post(url, {
      message,
      signature,
    });
  } catch (error) {
    console.log("Webhook call failed with error:\n", error);

    throw error;
  }
}
