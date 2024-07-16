import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});

const dynamo = DynamoDBDocumentClient.from(client);

const tableName = "User";
const header = {
  "Content-Type": "application/json",
};

export const handler = async (event, context) => {
  let response;
  try {
    switch (event.routeKey) {
      case "GET /user":
        response = getUserById(event.queryStringParameters.id);
        break;
      case "POST /user":
        response = createUser(JSON.parse(event.body));
        break;
      default:
        throw new Error(`Unsupported route: "${event.routeKey}"`);
    }
  } catch (err) {
    buildResponse(400, JSON.stringify({}));
  }

  return response;
};

async function getUserById(userId){
    const params ={
        TableName : tableName,
        Key : {
            'User_ID': userId
        }
    }
    return await dynamo.get(params).promise().then((response) => {
        return buildResponse(200, response.Item);
    },
    (error) =>{
      console.error("Error in getting the user: ",error)
    })
}

async function createUser(requestBody){
  const params = {
    TableName: tableName,
    Item: requestBody
  }
  return await dynamo.put(params).promise().then(()=>{
    const body = {
      Operation : 'POST',
      Message: 'User added to the table',
      Item: requestBody
    }
    return buildResponse(200,body);
  },
  (error) =>{
    console.error("Error saving the user: ", error)
  })
}

function buildResponse(statusCode, body){
    return {
        statusCode: statusCode,
        headers: header,
        body: JSON.stringify(body)
    };
}
