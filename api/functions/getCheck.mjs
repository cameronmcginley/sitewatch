import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { Logger } from "@aws-lambda-powertools/logger";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const dynamoDbClient = new DynamoDBClient({ region: "us-east-2" });
const dynamoDbDocClient = DynamoDBDocumentClient.from(dynamoDbClient);
const logger = new Logger();

export const handler = async (event) => {
  const headers = getHeaders();
  const userid = event.queryStringParameters?.userid;

  if (!userid) {
    logger.warn("Missing required parameter: userid");
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({
        message: "Missing required parameter: userid",
      }),
    };
  }

  const tableName = await getDynamoTableName();

  const params = {
    TableName: tableName,
    IndexName: "userid-sk-index",
    KeyConditionExpression: "userid = :userid AND sk = :sk",
    ExpressionAttributeValues: {
      ":userid": userid,
      ":sk": "CHECK",
    },
  };

  try {
    const data = await dynamoDbDocClient.send(new QueryCommand(params));
    if (data.Items && data.Items.length > 0) {
      data.Items.forEach((item) => {
        if (item.lastResult) {
          delete item.lastResult.page_text;
        }
      });
      logger.info("Data fetched successfully", { items: data.Items });
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data.Items),
      };
    } else {
      logger.info("No data found for the provided userid", { userid });
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          message: "No data found for the provided userid",
        }),
      };
    }
  } catch (error) {
    logger.error("Failed to fetch data", { error });
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Failed to fetch data",
        error: error.message,
      }),
    };
  }
};
