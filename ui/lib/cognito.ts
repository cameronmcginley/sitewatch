import { CognitoUserPool } from 'amazon-cognito-identity-js';

const poolData = {
  UserPoolId: 'YOUR_USER_POOL_ID', // Your user pool id here
  ClientId: 'YOUR_CLIENT_ID', // Your client id here
};

export const cognitoUserPool = new CognitoUserPool(poolData);
