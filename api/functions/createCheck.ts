import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { randomUUID } from 'crypto';
import { getHeaders } from '../utils/db';

const dynamoDb = new DynamoDBClient({ region: 'us-east-2' });
const tableName = 'webchecks';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const headers = getHeaders();
  const item = JSON.parse(event.body || '{}');

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
      body: JSON.stringify({ message: 'Item added successfully' }),
      headers,
    };
  } catch (error) {
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
