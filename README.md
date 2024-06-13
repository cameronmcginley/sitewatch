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

    subgraph AWS
        B[DynamoDB]
        C[API Gateway]
        F[Lambda]
        H[S3]
        I[SES]
        J[EventBridge]
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
    F -->|Get/Store HTML| H
    F -->|Criteria Met| I
    I -->|Email User| U1
    G --> A
    J -->|Timer| F
```