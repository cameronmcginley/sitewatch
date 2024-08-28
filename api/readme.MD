# SiteWatch API Documentation

This document provides information about the SiteWatch API, including endpoints, data models, and deployment details.

## Table of Contents

- [Architecture](#architecture)
- [API Endpoints](#api-endpoints)
- [Data Model](#data-model)
   - [User](#user)
   - [Primary Key Structure](#primary-key-structure)
   - [Attributes](#attributes)
   - [Check](#check)
   - [Primary Key Structure](#primary-key-structure-1)
   - [Attributes](#attributes-1)
- [Authentication](#authentication)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Monitoring](#monitoring)


## Architecture

The API is built using a serverless architecture on AWS:

- AWS Lambda for serverless functions
- Amazon DynamoDB for data storage
- Amazon API Gateway for RESTful API endpoints
- AWS Systems Manager Parameter Store for configuration management
- 
## API Endpoints

| Method | Endpoint | Description                 | Query Parameters |
|--------|----------|-----------------------------|------------------|
| POST   | /users   | Create a new user           | N/A              |
| GET    | /users   | Retrieve user information   | userid           |
| PUT    | /users   | Update user information     | userid           |
| POST   | /checks  | Create a new check          | N/A              |
| GET    | /checks  | Retrieve check information  | userid           |
| PUT    | /checks  | Update check information    | pk, sk           |
| DELETE | /checks  | Delete a check              | pk, sk           |

All endpoints require API key authentication.

## Data Model

### User

#### Primary Key Structure
- Partition Key (PK): `USER#<userid>`
- Sort Key (SK): `PROFILE`

#### Attributes
| Attribute   | Type   | Description                            |
|-------------|--------|----------------------------------------|
| PK          | String | Partition Key, user's unique identifier|
| SK          | String | Sort Key, fixed value: "PROFILE"       |
| id          | String | User's unique identifier               |
| email       | String | User's email address                   |
| name        | String | User's name                            |
| provider    | String | Authentication provider (e.g., "google")|
| userType    | String | User type (e.g., "default")            |
| checkCount  | Number | Number of checks created by the user   |
| createdAt   | String | ISO8601 timestamp of account creation  |

### Check

#### Primary Key Structure
- Partition Key (PK): `CHECK#<checkid>`
- Sort Key (SK): `CHECK`

#### Attributes
| Attribute      | Type   | Description                               |
|----------------|--------|-------------------------------------------|
| PK             | String | Partition Key, check's unique identifier  |
| SK             | String | Sort Key, fixed value: "CHECK"            |
| alias          | String | User-defined name for the check           |
| checkType      | String | Type of check (e.g., "KEYWORD CHECK")     |
| url            | String | URL to be monitored                       |
| cron           | String | Check schedule in cron format             |
| delayMs        | Number | Delay between checks in milliseconds      |
| email          | String | User's email for notifications            |
| status         | String | Check status (e.g., "ACTIVE")             |
| attributes     | Map    | Check-specific attributes                 |
| lastResult     | Map    | Result of the most recent check execution |
| createdAt      | String | ISO8601 timestamp of check creation       |
| updatedAt      | String | ISO8601 timestamp of last update          |
| userid         | String | ID of the user who created the check      |
| useProxy       | Boolean| Whether to use a proxy for the check      |
| runNowOverride | Boolean| Flag to run the check immediately         |
| mostRecentAlert| String | ISO8601 timestamp of the most recent alert|

## Authentication

All API endpoints are protected with API key authentication. The API key should be included in the `X-Api-Key` header of each request.

## Configuration

The API uses the following configuration parameters:

- `/sitewatch/<stage>/dynamodb/table_name`: DynamoDB table name
- `/sitewatch/<stage>/apiKey`: API key for authentication

These parameters are stored in AWS Systems Manager Parameter Store and accessed securely during runtime.

## Error Handling

The API uses standard HTTP status codes for error responses. Common error codes include:

- 400 Bad Request: Invalid input
- 401 Unauthorized: Missing or invalid API key
- 404 Not Found: Requested resource not found
- 500 Internal Server Error: Unexpected server error

Detailed error messages are included in the response body.

## Rate Limiting

The API is configured with the following usage plan:

- Burst Limit: 50 requests
- Rate Limit: 10 requests per second
- Quota: 10,000 requests per day

## Monitoring

CloudWatch alarms are set up to monitor API usage and prevent exceeding AWS free tier limits. An alarm triggers when approaching 1 million API calls per month.