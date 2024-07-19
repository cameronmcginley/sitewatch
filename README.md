# Store Checker Lambda

This lambda has two functionalities: 
1. Check an item's URL and see if it is available to buy
2. Get the lowest priced item from an Ebay search and check against threshold

Both are implemented together, with Enum to differentiate and unique fields in `links.py`

Emails are sent for results, using environment variables for `sender`, `receiver`, `password`

## Adding Modules to Lambda Layer

Create `python` folder (or any name), install modules to it, then add onto layer in AWS console.

- `mkdir python`
- `pip install -t python requests beautifulsoup4 aiohttp lxml tenacity`
- Zip it
- Upload to AWS layer



```mermaid
graph TD
    subgraph User
        U1[User]
    end

    subgraph Frontend
        A[React App]
            A1[Google Sign-In]
            A2[Website Notification Settings]
    end

    subgraph Supabase
        B[PostgreSQL Database]
        K[Supabase Storage]
    end

    subgraph Backend
        C[Express API]
    end

    subgraph AWS
        F[Lambda]
        J[EventBridge]
    end

    subgraph Google
        I[Gmail API]
    end

    subgraph Hosting
        G[GitHub Pages]
    end

    U1 --> A1
    A --> A2
    A1 --> A
    A2 -->|CRUD Operations| C
    C --> B
    F -->|Get Website Data| Internet
    F -->|Get Links/Data to Check| B
    F -->|Get/Store HTML| K
    F -->|Criteria Met| I
    I -->|Email User| U1
    G --> A
    J[EventBridge] -->|Timer| F
```

```mermaid
graph TD
    subgraph User
        U1[User]
    end

    subgraph Frontend
        A[React App]
            A1[Google Sign-In]
            A2[Website Notification Settings]
    end

    subgraph Firebase
        B[Firestore Database]
        K[Firebase Storage]
    end

    subgraph Backend
        C[Express API]
    end

    subgraph AWS
        F[Lambda]
        J[EventBridge]
    end

    subgraph Google
        I[Gmail API]
    end

    subgraph Hosting
        G[GitHub Pages]
    end

    U1 --> A1
    A --> A2
    A1 --> A
    A2 -->|CRUD Operations| C
    C --> B
    F -->|Get Website Data| Internet
    F -->|Get Links/Data to Check| B
    F -->|Get/Store HTML| K
    F -->|Criteria Met| I
    I -->|Email User| U1
    G --> A
    J -->|Timer| F

```


```mermaid
graph TD
    subgraph User
        U1[User]
    end

    subgraph Frontend
        A[React App]
            A1[Cognito Sign-In]
            A2[Website Notification Settings]
    end

    subgraph AWS
        B[DynamoDB]
        C[S3]
        F[Lambda]
        J[EventBridge]
        L[Cognito]
        I[SES]
        APIGW[API Gateway]
    end

    subgraph Hosting
        G[GitHub Pages]
    end

    U1 --> A1
    A --> A2
    A1 --> A
    A2 -->|CRUD Operations| APIGW
    APIGW -->|Invoke| B
    F -->|Get Website Data| Internet
    F -->|Get Links/Data to Check| B
    F -->|Get/Store HTML| C
    F -->|Criteria Met| I
    I -->|Email User| U1
    G --> A
    J -->|Timer| F


```

```mermaid
graph TD
    subgraph User
        U1[User]
    end

    subgraph Frontend
        A[Next.js App]
            A1[Next Auth Sign-In]
            A2[Website Notification Settings]
    end

    subgraph AWS
        B[DynamoDB]
        C[S3]
        F[Processor Lambda]
        E[Executor Lambdas]
        J[EventBridge]
        I[Gmail API]
        APIGW[API Gateway]
    end

    subgraph Hosting
        G[GitHub Pages]
    end

    U1 --> A1
    A --> A2
    A1 --> A
    A2 -->|CRUD Operations| APIGW
    APIGW -->|Invoke| B
    F -->|Get Links/Data to Check| B
    F -->|Invoke| E
    E -->|Check Website| Internet
    E -->|Get/Store HTML| C
    E -->|Criteria Met| I
    I -->|Email User| U1
    G --> A
    J -->|Timer| F


```

## Project Structure

```
project-root/
├── core/
│   └── ...                 # Core logic of the service
├── api/
│   └── ...                 # API endpoints and handlers
├── ui/
│   └── ...                 # User interface components and logic
└── deploy/
    ├── deploy-core.mjs     # Deployment script for the core service
    └── deploy-api.mjs      # Deployment script for the API service
```

## Deployment

To deploy the application, follow these steps. Make sure you have the necessary environment variables and dependencies set up.

### Prerequisites

- [Node.js](https://nodejs.org/) installed
- [Serverless Framework](https://www.serverless.com/framework/docs/getting-started/) installed
- AWS credentials configured for Serverless

### Setup

1. **Install dependencies:**

`npm install`

2. **Ensure AWS credentials are configured:**

Set up AWS credentials using the AWS CLI or manually configuring the ~/.aws/credentials file.

3. **Deploying Core**

Dev: `npm run deploy:core:dev`

Prod: `npm run deploy:core:prod`

3. **Deploying API**

Dev: `npm run deploy:api:dev`

Prod: `npm run deploy:api:prod`

4. **Deploying UI**

Changes to main branch auto-deployed by Vercel.