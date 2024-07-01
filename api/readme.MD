# DynamoDB Schema Design

## USER Table

### Primary Key Structure
- Partition Key (PK): `<userid>`
- Sort Key (SK): `USER`

### Attributes
| Attribute   | Type   | Description                            |
|-------------|--------|----------------------------------------|
| PK          | String | Partition Key, user's unique identifier|
| SK          | String | Sort Key, fixed value: "USER"          |
| email       | String | User's email address                   |
| tier        | String | Enum: FREE, PRO, etc.                  |
| checkLimit  | Number | Integer, max number of checks allowed  |
| status      | String | Enum: ACTIVE, SUSPENDED, etc.          |
| createdAt   | String | ISO8601 timestamp of account creation  |
| updatedAt   | String | ISO8601 timestamp of last update       |

### Global Secondary Indexes (GSI)
1. Email Index
   - Partition Key: `email`
   - Sort Key: `PK`

### Example Item
```json
{
  "PK": "123456",
  "SK": "USER",
  "email": "user@example.com",
  "tier": "PRO",
  "checkLimit": 100,
  "status": "ACTIVE",
  "createdAt": "2024-06-29T12:00:00Z",
  "updatedAt": "2024-06-29T12:00:00Z"
}
```

## CHECK Table

### Primary Key Structure
- Partition Key (PK): `<checkid>`
- Sort Key (SK): `CHECK`

### Attributes
| Attribute     | Type   | Description                               |
|---------------|--------|-------------------------------------------|
| PK            | String | Partition Key, check's unique identifier  |
| SK            | String | Sort Key, fixed value: "CHECK"            |
| userid        | String | ID of the user who created the check      |
| url           | String | URL to be checked                         |
| checkType     | String | Enum: AVAILABILITY, EBAY, etc.            |
| delayMs       | Number | Integer, delay between checks in ms       |
| status        | String | Enum: ACTIVE, PAUSED, FAILED, etc.        |
| attributes    | Map    | Type-specific attributes                  |
| createdAt     | String | ISO8601 timestamp of check creation       |
| updatedAt     | String | ISO8601 timestamp of last update          |
| lastExecutedAt| String | ISO8601 timestamp of last execution       |
| lastResult    | Map    | Result of the last check execution        |

### Global Secondary Indexes (GSI)
1. User-Check Index
   - Partition Key: `userid`
   - Sort Key: `PK`

2. Type-Status Index
   - Partition Key: `checkType`
   - Sort Key: `status`
   - Projected Attributes: `PK`, `userid`, `createdAt`

### Example Item
```json
{
  "PK": "abcdef",
  "SK": "CHECK",
  "userid": "123456",
  "url": "https://example.com",
  "checkType": "AVAILABILITY",
  "delayMs": 300000,
  "status": "ACTIVE",
  "attributes": {
    "keyword": "Example"
  },
  "createdAt": "2024-06-29T14:00:00Z",
  "updatedAt": "2024-06-29T14:00:00Z",
  "lastExecutedAt": "2024-06-29T14:05:00Z",
  "lastResult": {
    "status": "UP",
    "responseTime": 250,
    "keywordFound": true
  }
}
```

## Key Changes and Benefits

1. **Simplified Key Structure**: 
   - USER table: PK is just the userid, SK is the constant "USER"
   - CHECK table: PK is the checkid, SK is the constant "CHECK"

2. **Efficient Querying**: 
   - Get a specific user: Query USER table with PK = userid
   - Get a specific check: Query CHECK table with PK = checkid
   - Get all checks for a user: Query User-Check GSI with userid
   - Find user by email: Use the Email GSI in USER table
   - Get checks by type and status: Use the Type-Status GSI in CHECK table

3. **Flexibility Maintained**: The `attributes` map in the CHECK table still allows for type-specific attributes without requiring schema changes.

4. **Simplified Code**: Your application code can now use straightforward IDs without needing to prepend "USER#" or "CHECK#".

This simplified schema maintains the flexibility and querying efficiency of the previous design while reducing complexity in the key structure. It should be easier to work with in your application code and still provides good performance for your expected access patterns.