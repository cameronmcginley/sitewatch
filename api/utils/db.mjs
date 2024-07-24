import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

/**
 * Get headers for CORS.
 * @returns {Object} Headers for CORS.
 */
export const getHeaders = () => ({
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent",
  "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE",
});

const ssm = new SSMClient({ region: "us-east-2" });

/**
 * Fetches a parameter value from AWS SSM Parameter Store.
 * @param {string} name - The name of the parameter to fetch.
 * @returns {Promise<string>} The value of the parameter.
 * @throws Will throw an error if the parameter fetch fails.
 */
export const getParameterValue = async (name) => {
  try {
    const command = new GetParameterCommand({
      Name: name,
      WithDecryption: true,
    });
    const response = await ssm.send(command);
    return response.Parameter.Value;
  } catch (error) {
    console.error(`Error fetching parameter ${name}:`, error);
    throw error;
  }
};

/**
 * Fetches the DynamoDB table name from AWS SSM Parameter Store based on the current stage.
 * @returns {Promise<string>} The DynamoDB table name.
 * @throws Will throw an error if the parameter fetch fails.
 */
export const getDynamoTableName = async () => {
  const stage = process.env.STAGE || "dev";
  const parameterName = `/sitewatch/${stage}/dynamodb/tableName`;
  return await getParameterValue(parameterName);
};

/**
 * Helper function to format an object to DynamoDB format.
 * Checks if already in format, if not, formats it.
 * @param {Object} item - The item to be formatted.
 * @returns {Object} The item formatted for DynamoDB.
 */
export const formatDynamoDBItem = (item) => {
  const isDynamoDBFormat = (value) => {
    if (typeof value !== "object" || value === null) return false;
    const keys = Object.keys(value);
    if (keys.length !== 1) return false;
    const validTypes = ["S", "N", "BOOL", "L", "M", "NULL"];
    return validTypes.includes(keys[0]);
  };

  const formatAttribute = (value) => {
    if (isDynamoDBFormat(value)) {
      return value;
    } else if (typeof value === "string") {
      return { S: value };
    } else if (typeof value === "number") {
      return { N: value.toString() };
    } else if (typeof value === "boolean") {
      return { BOOL: value };
    } else if (value === null) {
      return { NULL: true };
    } else if (Array.isArray(value)) {
      return { L: value.map(formatAttribute) };
    } else if (typeof value === "object") {
      return {
        M: Object.entries(value).reduce((acc, [k, v]) => {
          acc[k] = formatAttribute(v);
          return acc;
        }, {}),
      };
    } else {
      throw new Error(`Unsupported attribute type: ${typeof value}`);
    }
  };

  const formattedItem = Object.entries(item).reduce((acc, [key, value]) => {
    acc[key] = formatAttribute(value);
    return acc;
  }, {});

  console.log("Formatted item:", formattedItem);

  return formattedItem;
};
