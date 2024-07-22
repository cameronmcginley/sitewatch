"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const db_1 = require("../utils/db");
const dynamoDb = new client_dynamodb_1.DynamoDBClient({ region: 'us-east-2' });
const tableName = 'webchecks';
const handler = async (event) => {
    const headers = (0, db_1.getHeaders)();
    const item = JSON.parse(event.body || '{}');
    const { pk, sk, ...attributes } = item;
    const updateExpression = 'SET ' +
        Object.keys(attributes)
            .map((key, idx) => `#attr${idx} = :val${idx}`)
            .join(', ');
    const expressionAttributeNames = Object.keys(attributes).reduce((acc, key, idx) => {
        acc[`#attr${idx}`] = key;
        return acc;
    }, {});
    const expressionAttributeValues = Object.keys(attributes).reduce((acc, key, idx) => {
        acc[`:val${idx}`] = { S: String(attributes[key]) };
        return acc;
    }, {});
    const params = {
        TableName: tableName,
        Key: { pk: { S: pk }, sk: { S: sk } },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'UPDATED_NEW',
    };
    try {
        const data = await dynamoDb.send(new client_dynamodb_1.UpdateItemCommand(params));
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Item updated successfully', data }),
            headers,
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to update item',
                error: error.message,
            }),
            headers,
        };
    }
};
exports.handler = handler;
