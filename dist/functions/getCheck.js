"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const db_1 = require("../utils/db");
const dynamoDb = new client_dynamodb_1.DynamoDBClient({ region: "us-east-2" });
const tableName = "webchecks";
const handler = async (event) => {
    const headers = (0, db_1.getHeaders)();
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
        const data = await dynamoDb.send(new client_dynamodb_1.QueryCommand(params));
        if (data.Items && data.Items.length > 0) {
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify(data.Items),
            };
        }
        else {
            return {
                statusCode: 404,
                headers,
                body: JSON.stringify({
                    message: "No data found for the provided userid",
                }),
            };
        }
    }
    catch (error) {
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
exports.handler = handler;
