# SiteWatch

SiteWatch is a solution for automating website monitoring and alerting. A user can upload a URL, a desired interval, and select one of our custom check functions (keyword check, page difference, etc), and will recieve email alerts when conditions are met.

See [here]() for more documentation (including a demo video) on features and functionality of the app itself. This readme will focus on the architecture, tech stack, and development.

![Architecture Diagram](assets/architecture_diagram.png)

## Architecture Overview

SiteWatch employs a serverless architecture using AWS services, with a React-based frontend hosted on Vercel. The system is divided into several key components:

1. **Frontend**: Next.js application with React
2. **API Layer**: AWS API Gateway with Lambda functions
3. **Core Processing**: Lambda functions for URL processing and execution
4. **Proxy**: Oxylabs proxy for fetching website data
5. **Database**: DynamoDB for primary storage, Redis for caching
6. **Authentication**: NextAuth.js for OAuth-based authentication
7. **Scheduling**: Amazon EventBridge for timed executions
8. **Email Notifications**: Gmail API

## Technology Stack

### Frontend
- TypeScript
- Next.js
- React
- Vercel (hosting)
- NextAuth.js (authentication)
- Axios (HTTP client)
- Tailwind CSS
- shadcn/ui

### Backend
- AWS Lambda
  - Core Processor/Executor (Python 3.8)
  - API CRUD functions (Node.js 20.x)
- Amazon EventBridge
- AWS API Gateway
- DynamoDB
- Redis (caching layer)
- Gmail API
- Serverless Framework (for AWS deployments)
- AWS SSM Parameter Store (secrets management)

## Project Structure

```
root/
├── core/
│   ├── lambda_processor.py
│   ├── lambda_executor.py
│   ├── fetch_url.py
│   └── url_check_functions/
├── api/
│   └── functions/
├── db/
│   ├── lambda_redis_sync.py
│   └── lambda_stream_processor.py
├── ui/
│   ├── components/
│   └── app/
└── deploy/
    └── deploy.mjs
```

## Core Functionality

The core functionality is implemented via two main Lambda functions:

1. **Processor Lambda**
   1. Fetches check items from Redis, failover to DynamoDB
   2. Computes which checks are ready to run based off their `cron` field
   3. Batches and spins of executor lambdas
2. **Executor Lambda**
   1. Asynchronously performs the custom check functions against each url
   2. Writes necessary data back to DynamoDB
   3. Send email alerts for checks if necessary

Key features of the core implementation:

- Asynchronous URL fetching using `aiohttp` and `asyncio`
- Randomized User-Agent and proxy selection
- Extensible architecture for adding new check functions

## API Layer

The API layer handles CRUD operations for managing `users` and `checks` in DynamoDB.

Implemented with AWS API Gateway to route requests to lambda functions.

**Features:**
- Secure configuration management via AWS SSM Parameter Store.
- API key-based authentication for accessing endpoints.

### Endpoints

**Checks Endpoints**

1. `GET /checks`
   - Query parameters: `userid`
   - Retrieves all checks for a specific user

2. `POST /checks`
   - Creates a new check
   - Request body: Check details (excluding `pk` and `sk`)

3. `PUT /checks`
   - Updates an existing check
   - Request body: `pk`, `sk`, `userid`, and fields to update

4. `DELETE /checks`
   - Deletes a check
   - Request body: `pk`, `sk`

**Users Endpoints**

1. `GET /users`
   - Query parameters: `userid`
   - Retrieves user information

2. `POST /users`
   - Creates a new user
   - Request body: User details (excluding `id` and `checkCount`)

3. `PUT /users`
   - Query parameters: `userid`
   - Updates user information
   - Request body: Fields to update (may include `checkCountChange` to increment/decrement)

4. `DELETE /users`
   - Query parameters: `userid`
   - Deletes a user

## Data Storage and Caching

- **DynamoDB**: Primary database using a single-table design
  - Stores **Checks** (the defitinition item including URL and interval) and **Users**
- **Redis**: Caching layer to optimize read operations and reduce DynamoDB costs
  - Syncs with DynamoDB on DB updates and daily at midnight UTC
    - **Stream Processor Lambda** and **Redis Sync Lambda**
  
### Why Redis?

In our data, we store run intervals (i.e. run a given check every 30 mins) in cron format. This allows very dynamic intervals to be defined.

However, checking when an item is actually ready to run is not straightforward. We must manually check the current time against a given cron to see if that item is ready to run.

This functionality can not be implemented on a database query, therefore we are required to fetch every check from the database and perform this function in our lambda.

DynamoDB costs are based on data sent, and with our processor lambda running every 5 minutes, there is a lot of waste since most items will not be ready to run every 5 minutes. 

Caching in redis (the subset of fields we need in the executor anyways) lets us read all of our items without cost.


## Authentication and Permissions

- NextAuth.js for OAuth-based authentication (currently supporting Google sign-in)
- Custom middleware for page-level access control
- Tiered permissions system tied to user accounts

## Deployment

The project uses the Serverless Framework for deploying AWS resources:

- Separate deployment scripts for core functionality, API, and DB
- Support for both development and production environments
- Automatic UI deployment via Vercel on main branch changes

## Extensibility

The system is designed to be easily extensible, particularly for adding new URL check functions. This involves updating UI constants, type definitions, and implementing the new function logic.

## Data

Below represents how `checks` and `users` are stored.

### Check Item
```
interface Check {
  // Partition Key and Sort Key
  pk: string;  // Format: "CHECK#{uuid}"
  sk: string;  // Always "CHECK"

  // User-defined fields
  alias: string;
  url: string;
  useProxy: boolean;
  email: string;
  checkType: 'KEYWORD_CHECK' | 'EBAY_PRICE_THRESHOLD' | 'AI_CHECK' | 'PAGE_DIFFERENCE';
  attributes: {
    [key: string]: any;  // Varies based on checkType
  };
  
  // Scheduling
  cron: string;
  runNowOverride: boolean; // How the "run now" button in the UI works

  // Status and results
  status: 'ACTIVE' | 'PAUSED';
  lastResult?: {
    status: 'SUCCESS' | 'FAILED';
    message: string;
    timestamp: string;
  };
  mostRecentAlert: string | null;

  // Metadata
  userid: string;
  createdAt: string;
  updatedAt: string;
  delayMs: number;
}
```

### Check Item Synced to Redis

```
Key: "check:{uuid}"

Hash fields:
{
  "alias": string,
  "url": string,
  "email": string,
  "checkType": string,
  "attributes": string (JSON stringified object),
  "cron": string,
  "runNowOverride": string ("true" or "false")
}
```

### User Item

```
interface User {
  // Partition Key and Sort Key
  pk: string;  // Format: "USER#{id}"
  sk: string;  // Always "PROFILE"

  // User details
  id: string;
  name: string;
  email: string;
  provider: 'google';
  userType: 'admin' | 'default';

  // Usage statistics
  checkCount: number;

  // Metadata
  createdAt: string;
}
```