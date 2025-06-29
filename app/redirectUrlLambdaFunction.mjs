// index.mjs
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

// Configure AWS SDK v3 DynamoDB Client
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Configuration
const tableName = "UrlShortenerMappings"; // Matches your existing table

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  // Extract shortCode from path parameters (e.g., from API Gateway)
  const shortCode = event.pathParameters?.shortCode;

  // Validate shortCode
  if (!shortCode || typeof shortCode !== "string") {
    return {
      statusCode: 301,
      headers: { Location: "https://app.itsurl.com" },
      body: ""
    };
  }

  try {
    // Query DynamoDB for the shortCode
    const params = {
      TableName: tableName,
      Key: { shortCode }
    };
    const result = await docClient.send(new GetCommand(params));

    if (result.Item) {
      // Short code found, return a 301 redirect to the original URL
      console.log(`Redirecting ${shortCode} to ${result.Item.originalUrl}`);
      return {
        statusCode: 301,
        headers: { Location: result.Item.originalUrl },
        body: ""
      };
    } else {
      // Short code not found
      console.log(`Short code ${shortCode} not found in ${tableName}`);
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Short URL not found." }),
        headers: { "Content-Type": "application/json" }
      };
    }
  } catch (error) {
    console.error("Error querying DynamoDB:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error." }),
      headers: { "Content-Type": "application/json" }
    };
  }
};
