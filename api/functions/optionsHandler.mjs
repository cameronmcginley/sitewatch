import { getHeaders } from "../utils/db.mjs";

export const handler = async (event) => {
  const headers = getHeaders();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: "CORS preflight request successful",
    }),
  };
};
