"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const crypto_1 = require("crypto");
const db_1 = require("../utils/db");
const dynamoDb = new client_dynamodb_1.DynamoDBClient({ region: 'us-east-2' });
const tableName = 'webchecks';
const handler = async (event) => {
    const headers = (0, db_1.getHeaders)();
    const item = JSON.parse(event.body || '{}');
    const params = {
        TableName: tableName,
        Item: {
            pk: { S: `CHECK#${(0, crypto_1.randomUUID)()}` },
            sk: { S: `${item.type}` },
            ...Object.entries(item).reduce((acc, [key, value]) => {
                acc[key] = { S: String(value) };
                return acc;
            }, {}),
        },
    };
    try {
        await dynamoDb.send(new client_dynamodb_1.PutItemCommand(params));
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Item added successfully' }),
            headers,
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to add item',
                error: error.message,
            }),
            headers,
        };
    }
};
exports.handler = handler;
