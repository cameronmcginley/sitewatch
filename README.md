# SiteWatch

## Table of Contents
- [SiteWatch](#sitewatch)
  - [Table of Contents](#table-of-contents)
  - [Introduction](#introduction)
  - [Architecture Overview](#architecture-overview)
  - [Technology Stack](#technology-stack)
    - [Frontend](#frontend)
    - [Backend](#backend)
  - [Project Structure](#project-structure)
  - [Core Functionality](#core-functionality)
  - [API Layer](#api-layer)
    - [Endpoints](#endpoints)
  - [Data Management](#data-management)
    - [Data Storage and Caching](#data-storage-and-caching)
      - [Why Redis?](#why-redis)
      - [Redis Alternative - 288 Buckets](#redis-alternative---288-buckets)
    - [Data Models](#data-models)
      - [Check Item](#check-item)
      - [Check Item Synced to Redis](#check-item-synced-to-redis)
    - [Data Compression](#data-compression)
      - [Compression Statistics](#compression-statistics)
  - [Authentication and Permissions](#authentication-and-permissions)
  - [Deployment and Hosting](#deployment-and-hosting)
    - [Deployment](#deployment)
    - [Hosting](#hosting)
      - [Key Components Inside the VPS](#key-components-inside-the-vps)
      - [How It Works](#how-it-works)
      - [Deploying](#deploying)
  - [Extensibility](#extensibility)

## Introduction

SiteWatch is a solution for automating website monitoring and alerting. A user can upload a URL, a desired interval, and select one of our custom check functions (keyword check, page difference, etc), and will receive email alerts when conditions are met.

See [here]() for more documentation (including a demo video) on features and functionality of the app itself. This README focuses on the architecture, tech stack, and development.

![Architecture Diagram](assets/architecture_diagram.png)

## Architecture Overview

SiteWatch uses a serverless architecture using AWS services, with a React-based frontend hosted on a VPS. The system is divided into several key components:

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
   3. Batches and spins up executor lambdas
2. **Executor Lambda**
   1. Asynchronously performs the custom check functions against each URL
   2. Writes necessary data back to DynamoDB
   3. Sends email alerts for checks if necessary

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

## Data Management

### Data Storage and Caching

- **DynamoDB**: Primary database using a single-table design
  - Stores **Checks** (the definition item including URL and interval) and **Users**
- **Redis**: Caching layer to optimize read operations and reduce DynamoDB costs
  - Syncs with DynamoDB on DB updates and daily at midnight UTC
    - **Stream Processor Lambda** and **Redis Sync Lambda**
  
#### Why Redis?

In our data, we store run intervals (i.e. run a given check every 30 mins) in cron format. This allows very dynamic intervals to be defined.

However, checking when an item is actually ready to run is not straightforward. We must manually check the current time against a given cron to see if that item is ready to run.

This functionality cannot be implemented on a database query, therefore we are required to fetch every check from the database and perform this function in our lambda.

DynamoDB costs are based on data sent, and with our processor lambda running every 5 minutes, there is a lot of waste since most items will not be ready to run every 5 minutes. 

Caching in Redis (the subset of fields we need in the executor anyways) lets us read all of our items without cost.

#### Redis Alternative - 288 Buckets

Since I can't query the database directly to fetch ready-to-run items, can I store them differently? One thought was to create a bucket for each runtime of each day (288 buckets total assuming we run every 5 minutes, or less if we want to batch different times into one bucket), and place each item's ID in the appropriate buckets for which it needs to be run. For each runtime, fetch the bucket for the IDs, then fetch the items. Managing this seems annoying though, and could need lots of writes if an item is in many buckets.

### Data Models

#### Check Item
```typescript
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

#### Check Item Synced to Redis

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

### Data Compression

Certain `checks`, e.g. `PAGE DIFFERENCE`, must store the text data from websites in order to compare past and current data. From the HTML, we extract text and do basic cleaning, followed by [Zstandard](https://facebook.github.io/zstd/) compression and Base64 encoding.

When storing website's text data, this reduces bytes stored by about 50% on average. 

#### Compression Statistics

We measured a handful of websites with different algorithms.

The table below shows some of the bester performers in terms of size reduction.

Text preprocessing only includes extracting text from html and cleaning, i.e. normalizing whitespace, lowercasing, etc. Tried improving with tokenization and word stemming, but didn't find much improvement if any. Same with combining compression algorithms like brotli and snappy. Average cleaning time is about `13ms`.

As shown, the greatest size decrease uses `brotli`, but its efficiency is one of the worst. For this reason we chose `zstd (level 6)` its relatively good compression ratio, while maintaining quick speeds since this compression will happen frequently.

See full test script at [core\data\test_compression.py](core\data\test_compression.py)

| Compression Algorithm  | Average Compressed Length (bytes) | Average Compression Time (ms) | Average Decompression Time (ms) | Percentage Reduction (%) | Percentage Reduction per ms |
|------------------------|-----------------------------------|-------------------------------|---------------------------------|--------------------------|-----------------------------|
| brotli (level 11)       | 2040.500                          | 4.603962                       | 0.061462                        | 64.325559                  | 13.971782                    |
| brotli (level 6)        | 2377.875                          | 0.456753                       | 0.043616                        | 58.427169                  | 127.918488                   |
| zstd (level 22)         | 2512.625                          | 1.196556                       | 0.042256                        | 56.071310                  | 46.860571                    |
| zstd (level 6)          | 2567.750                          | 0.073750                       | 0.033159                        | 55.107549                  | 747.221247                   |
| zlib (level 9)          | 2578.875                          | 0.207181                       | 0.034853                        | 54.913048                  | 265.048328                   |
| zlib (level 6)          | 2585.375                          | 0.097050                       | 0.035066                        | 54.799408                  | 564.651330                   |
| gzip (level 9)          | 2594.875                          | 0.226950                       | 0.040344                        | 54.633317                  | 240.728435                   |

## Authentication and Permissions

- NextAuth.js for OAuth-based authentication (currently supporting Google sign-in)
- Custom middleware for page-level access control
- Tiered permissions system tied to user accounts

## Deployment and Hosting

### Deployment

The project uses the Serverless Framework for deploying AWS resources:

- Separate deployment scripts for Core, API, and DB
- Support for both development and production environments

### Hosting

The SiteWatch frontend is deployed on a Virtual Private Server (VPS) using a DigitalOcean Droplet. This VPS is configured to serve the Next.js application and handle incoming HTTP requests.

#### Key Components Inside the VPS

1. **Nginx**:
   - **Role**: Acts as a web server and reverse proxy, directing incoming HTTP/HTTPS traffic to the Next.js application.
   - **Functionality**:
     - **Reverse Proxy**: Listens on ports 80 (HTTP) and 443 (HTTPS), forwarding traffic to the application running on port 3000.
     - **Security**: Manages SSL/TLS certificates to secure client-server communication.

2. **PM2**:
   - **Role**: Manages the Node.js process, ensuring the Next.js application stays running continuously.
   - **Functionality**:
     - **Process Management**: Runs and monitors the application.
     - **Auto-Restart**: Automatically restarts the application if it crashes or stops unexpectedly.
     - **Logging**: Captures logs.

#### How It Works

- **Traffic Handling**: Nginx receives requests to `sitewatchapp.com` and proxies them to the Next.js application on port 3000.
- **Application Management**: PM2 ensures continuous uptime by restarting the application if it fails.
- **SSL Management**: Nginx handles SSL/TLS, securing data transmission if SSL is configured.

#### Deploying

Automatically calls deploy script when code is pushed to the `main` branch.

## Extensibility

The system is designed to be easily extensible, particularly for adding new URL check functions. To add new check function, create a script file and edit the necessary places.

TODO: Steps (basically just search the repo for "KEYWORD CHECK" and place the new check function in the same places)