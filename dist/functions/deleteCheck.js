"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const db_1 = require("../utils/db");
const dynamoDb = new client_dynamodb_1.DynamoDBClient({ region: 'us-east-2' });
const tableName = 'webchecks';
const handler = async (event) => {
    const headers = (0, db_1.getHeaders)();
    const { pk, sk } = JSON.parse(event.body || '{}');
    const params = {
        TableName: tableName,
        Key: { pk: { S: pk }, sk: { S: sk } },
    };
    try {
        await dynamoDb.send(new client_dynamodb_1.DeleteItemCommand(params));
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Item deleted successfully' }),
            headers,
        };
    }
    catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to delete item',
                error: error.message,
            }),
            headers,
        };
    }
};
exports.handler = handler;
