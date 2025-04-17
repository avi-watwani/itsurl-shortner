// index.mjs (using ES Module syntax, common with newer Node.js runtimes)
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { randomBytes } from 'crypto'; // Built-in Node.js crypto module

// Configure AWS SDK v3 DynamoDB Client
const client = new DynamoDBClient({ region: process.env.AWS_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Configuration
const tableName = "UrlShortenerMappings"; // Make sure this matches your DynamoDB table name
const MAX_RETRIES = 5; // Max attempts to generate a unique short code
const CODE_LENGTH = 7; // Length of the short code (adjust as needed)

// Function to generate a URL-safe random string
const generateShortCode = (length) => {
  // Generates slightly more bytes than needed, then slices
  const buffer = randomBytes(Math.ceil(length * 0.75));
  // base64url encoding is URL-safe (uses A-Z, a-z, 0-9, -, _)
  return buffer.toString('base64url').slice(0, length);
};

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  let originalUrl;
  let customShortCode;
  try {
    // API Gateway usually sends POST body in event.body (as a string)
    if (typeof event.body === 'string') {
        const body = JSON.parse(event.body);
        originalUrl = body.originalUrl;
        customShortCode = body.customShortCode;
    } else {
        // Handle direct Lambda test invocation or other triggers
         originalUrl = event.originalUrl;
    }

    if (!originalUrl || typeof originalUrl !== 'string' || !originalUrl.startsWith('http')) {
      console.error("Validation Error: Invalid originalUrl provided.");
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid URL format provided. Must start with http or https." }),
        headers: { "Content-Type": "application/json" }
      };
    }
    if (customShortCode) {
      // Validate the custom short code format
      const isValid = /^[a-zA-Z0-9!@#$%&*-_?]{1,10}$/.test(customShortCode);
      if (!isValid) {
          console.error("Validation Error: Invalid customShortCode provided.");
          return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid customShortCode format. It must be 1 to 10 characters long, alphanumeric, or include allowed special characters (!@#$%&*-_?)."
            }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*", // Allow requests from any origin
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
            }
          };
      } else {
        // Check if the customShortCode already exists
        const checkParams = {
            TableName: tableName,
            Key: { shortCode: customShortCode },
        };
        const checkResult = await docClient.send(new GetCommand(checkParams));

        if (checkResult.Item) {
            console.error(`Custom shortCode '${customShortCode}' already exists.`);
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Custom shortCode already exists. Please choose a different one." }),
                headers: { "Content-Type": "application/json" }
            };
        }

        // Save the customShortCode
        const putParams = {
            TableName: tableName,
            Item: {
                shortCode: customShortCode,
                originalUrl: originalUrl,
                createdAt: new Date().toISOString(),
            },
            ConditionExpression: "attribute_not_exists(shortCode)"
        };

        console.log(`Attempting to save customShortCode: ${customShortCode} -> ${originalUrl}`);
        await docClient.send(new PutCommand(putParams));

        const fullShortUrl = `https://itsurl.com/${customShortCode}`;
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "URL shortened successfully!",
                shortUrl: fullShortUrl,
                shortCode: customShortCode,
                originalUrl: originalUrl
            }),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
            }
        };
    }
  }
  } catch (error) {
    console.error("Error parsing request body:", error);
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Invalid request body." }),
      headers: { "Content-Type": "application/json" }
    };
  }

  let shortCode = '';
  let attempts = 0;
  let itemSaved = false;

  while (attempts < MAX_RETRIES && !itemSaved) {
    attempts++;
    shortCode = generateShortCode(CODE_LENGTH);
    console.log(`Attempt ${attempts}: Generated shortCode: ${shortCode}`);

    try {
        // Check if the code already exists (Collision check)
        const checkParams = {
            TableName: tableName,
            Key: { shortCode: shortCode },
        };
        const checkResult = await docClient.send(new GetCommand(checkParams));

        if (!checkResult.Item) {
            // Code does not exist, save it
            const putParams = {
                TableName: tableName,
                Item: {
                    shortCode: shortCode,
                    originalUrl: originalUrl,
                    createdAt: new Date().toISOString(),
                },
                // Conditional expression to ensure we don't overwrite if it was created
                // between our GetCommand and this PutCommand (extremely rare, but safe)
                ConditionExpression: "attribute_not_exists(shortCode)"
            };

            console.log(`Attempting to save: ${shortCode} -> ${originalUrl}`);
            await docClient.send(new PutCommand(putParams));
            itemSaved = true;
            console.log(`Successfully saved: ${shortCode}`);
        } else {
             console.log(`Collision detected for shortCode: ${shortCode}. Retrying...`);
        }
    } catch (error) {
        // Handle potential conditional check failure (attribute_exists)
        if (error.name === 'ConditionalCheckFailedException') {
            console.warn(`Collision detected via ConditionalCheckFailedException for shortCode: ${shortCode}. Retrying...`);
        } else {
             console.error(`Error interacting with DynamoDB (Attempt ${attempts}):`, error);
             // Decide if we should retry or fail hard
             if (attempts >= MAX_RETRIES) {
                 return {
                     statusCode: 500,
                     body: JSON.stringify({ message: "Internal Server Error saving to database after retries." }),
                     headers: { "Content-Type": "application/json" }
                 };
             }
             // Allow retry by continuing the loop
        }
    }
  } // end while loop

  if (!itemSaved) {
     console.error(`Failed to generate and save a unique short code after ${MAX_RETRIES} attempts.`);
     return {
        statusCode: 500,
        body: JSON.stringify({ message: "Failed to generate a unique short code. Please try again later." }),
        headers: { "Content-Type": "application/json" }
     };
  }

  // Construct the full short URL (we'll need the domain name later)
  // For now, we just return the code, API Gateway/Frontend will construct the full URL
  // TODO: Replace 'mydomain.com' with your actual domain or dynamically get it
  const fullShortUrl = `https://itsurl.com/${shortCode}`;

  return {
    statusCode: 201, // 201 Created is appropriate here
    body: JSON.stringify({
       message: "URL shortened successfully!",
       shortUrl: fullShortUrl, // Send the full URL back
       shortCode: shortCode, // Send the code back too, might be useful
       originalUrl: originalUrl
    }),
    // Crucial for frontend to avoid CORS errors when called from browser
    headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Allow requests from any origin (adjust in production!)
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"
     }
  };
};
