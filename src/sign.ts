import axios from "axios";
import config from "config";

export async function sign(message: string) {
  try {
    const response = await axios.get(`${config.get("api.base")}/crypto/sign`, {
      params: {
        message,
      },
      headers: {
        Authorization: config.get("api.apiKey"),
      },
    });

    return response.data;
  } catch (error) {
    if (
      (error.response && error.response.status === 502) ||
      error.response.status === 429
    ) {
      console.log(
        "sign called failed with status code: ",
        error.response.status
      );
    } else {
      throw error;
    }
  }
}
