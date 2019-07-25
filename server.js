const express = require('express');
const WebSocket = require('ws');
const uuidv1 = require('uuid/v1');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new WebSocket.Server({ server });

// To keep track of number of connections
let numOfConnections = {
  type: "incomingConnectionCount",
  connections: 0
}

// Set up a callback that will run when a client connects to the server
// When a client connects they are assigned a socket, represented by
// the ws parameter in the callback.
wss.on('connection', (ws) => {
  console.log('Client connected');
  numOfConnections.connections++;
  wss.clients.forEach(function each(client) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(numOfConnections));
    }
  });
  ws.on('message', function incoming(message) {
    let messageObject = JSON.parse(message);
    switch(messageObject.type) {
        case "postMessage":
          let uuid = uuidv1();
          messageObject.type = "incomingMessage";
          messageObject.id = uuid;
          wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(JSON.stringify(messageObject));
            }
          });
          break;
        case "postNotification":
          // handle incoming notification
          break;
        default:
          // show an error in the console if the message type is unknown
          throw new Error("Unknown event type " + message.type);
      }
  });
  // Set up a callback for when a client closes the socket. This usually means they closed their browser.
  ws.on('close', () => {
    console.log('Client disconnected');
    numOfConnections.connections--;
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(numOfConnections));
      }
    });
  });
});
