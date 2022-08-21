import axios from "axios";
import config from "config";

export async function verify(
  message: string,
  signature: string
): Promise<boolean> {
  try {
    await axios.get(`${config.get("api.base")}/crypto/verify`, {
      params: {
        message,
        signature,
      },
      headers: {
        Authorization: config.get("api.apiKey"),
      },
    });

    return true;
  } catch (error) {
    if (error.response.status === 400) {
      return false;
    }

    throw error;
  }
}
