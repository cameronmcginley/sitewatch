import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";

const dynamoDb = new DynamoDBClient({ region: "us-east-2" });

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const httpMethod = event.requestContext.http.method;
  const path = event.requestContext.http.path;
  const tableName = "webchecks";

  const headers = {
    "Content-Type": "*/*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*", // Change this to your domain if needed
    "Access-Control-Allow-Methods": "DELETE,PUT,POST,GET,OPTIONS",
    "Access-Control-Allow-Credentials": true,
  };

  if (httpMethod === "OPTIONS") {
    // Handle CORS preflight requests
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({}),
    };
  }

  // if (httpMethod === "GET" && path === "/prod/items") {
  //   // READ operation
  //   const params = {
  //     TableName: tableName,
  //   };

  //   try {
  //     const data = await dynamoDb.send(new ScanCommand(params));
  //     return {
  //       statusCode: 200,
  //       body: JSON.stringify(data.Items),
  //       headers,
  //     };
  //   } catch (error) {
  //     console.error(error);
  //     return {
  //       statusCode: 500,
  //       body: JSON.stringify({
  //         message: "Failed to fetch data",
  //         error: error.message,
  //       }),
  //       headers,
  //     };
  //   }
  // }
  if (httpMethod === "GET" && path === "/prod/items") {
    // READ operation
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
  } else if (httpMethod === "POST" && path === "/prod/items") {
    // CREATE operation
    const item = JSON.parse(event.body);
    const params = {
      TableName: tableName,
      Item: {
        pk: { S: `CHECK#${randomUUID()}` },
        sk: { S: `${item.type}` },
        ...Object.entries(item).reduce((acc, [key, value]) => {
          acc[key] = { S: String(value) };
          return acc;
        }, {}),
      },
    };

    try {
      await dynamoDb.send(new PutItemCommand(params));
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Item added successfully" }),
        headers,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Failed to add item",
          error: error.message,
        }),
        headers,
      };
    }
  } else if (httpMethod === "PUT" && path === "/prod/items") {
    // UPDATE operation
    const item = JSON.parse(event.body);
    const { pk, sk, ...attributes } = item;

    const updateExpression =
      "SET " +
      Object.keys(attributes)
        .map((key, idx) => `#attr${idx} = :val${idx}`)
        .join(", ");
    const expressionAttributeNames = Object.keys(attributes).reduce(
      (acc, key, idx) => {
        acc[`#attr${idx}`] = key;
        return acc;
      },
      {}
    );
    const expressionAttributeValues = Object.keys(attributes).reduce(
      (acc, key, idx) => {
        acc[`:val${idx}`] = { S: String(attributes[key]) };
        return acc;
      },
      {}
    );

    const params = {
      TableName: tableName,
      Key: { pk: { S: pk }, sk: { S: sk } },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };

    try {
      const data = await dynamoDb.send(new UpdateItemCommand(params));
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Item updated successfully", data }),
        headers,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Failed to update item",
          error: error.message,
        }),
        headers,
      };
    }
  } else if (httpMethod === "DELETE" && path === "/prod/items") {
    // DELETE operation
    const { pk, sk } = JSON.parse(event.body);
    const params = {
      TableName: tableName,
      Key: { pk: { S: pk }, sk: { S: sk } },
    };

    try {
      await dynamoDb.send(new DeleteItemCommand(params));
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Item deleted successfully" }),
        headers,
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({
          message: "Failed to delete item",
          error: error.message,
        }),
        headers,
      };
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Unsupported method or path, method: ${httpMethod}, path: ${path}`,
      }),
      headers,
    };
  }
};
