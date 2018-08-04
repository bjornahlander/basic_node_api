const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const log = console.log;

// Configuration for the server
const {
  ENV_NAME, HTTP_PORT
} = require('./config');
const PARSE_QUERY_STRING = true;
const POST = 'POST';

// HTTP server
const httpServer = http.createServer(entryHandler);
httpServer.listen(HTTP_PORT, () => { 
  log(`Environment: ${ENV_NAME}`);
  log(`Listening on port ${HTTP_PORT}`) 
});

function entryHandler(req, res) {
  const { pathname } = url.parse(req.url, PARSE_QUERY_STRING);
  // Extract the path and trim slashes in the beginning and at the end
  const path = pathname.replace(/^\/+|\/+$/g, '');
  const method = req.method.toUpperCase();
  const decoder = new StringDecoder('utf-8');
  let buffer = '';
  req.on('data', (data) => {
    buffer += decoder.write(data);
  });

  req.on('end', () => {
    buffer += decoder.end();
    // Rouing defferently depending on the request method
    const chosenRouter = method === POST ? postRouter : router;
    // Route to appropriate handler
    const chosenHandler = typeof(chosenRouter[path]) !== 'undefined' ?
      chosenRouter[path] : handlers.notFound;
    const data = {
      path,
      method,
      payload: buffer
    }
    chosenHandler(data, (status, payload) => {
      status = typeof(status) == 'number' ? status : 200;
      payload = typeof(payload) == 'object' ? payload : {}
      const payloadString = JSON.stringify(payload);
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(status);
      res.end(payloadString);
      log('Returning response:', status, payloadString);    
    });
  });
}

const handlers = {
  ping: (data, cb) => cb(200),
  hello: (data, cb) => cb(200, { message: 'Welcome' }),
  notFound: (data, cb) => cb(404)
};
// All handlers for POST requests
const postRouter = {
  hello: handlers.hello
};
// All handlers that doesn't care about the request method
const router = {
  ping: handlers.ping
};

