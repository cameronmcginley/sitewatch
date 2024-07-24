import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { getHeaders, getDynamoTableName } from "../utils/db.mjs";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });

export const handler = async (event) => {
  const headers = getHeaders();
  const userid = event.queryStringParameters?.userid;

  if (!userid) {
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
      ":userid": { S: userid },
      ":sk": { S: "CHECK" },
    },
  };

  try {
    const data = await dynamoDb.send(new QueryCommand(params));
    if (data.Items && data.Items.length > 0) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(data.Items),
      };
    } else {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({
          message: "No data found for the provided userid",
        }),
      };
    }
  } catch (error) {
    console.error(error);
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
