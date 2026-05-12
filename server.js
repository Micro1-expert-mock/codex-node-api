const http = require('http');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';

const users = {
  'user-101': {
    userId: 'user-101',
    firstName: 'Ava',
    lastName: 'Sharma',
    email: 'ava.sharma@example.com',
  },
  'user-102': {
    userId: 'user-102',
    firstName: 'Noah',
    lastName: 'Patel',
    email: 'noah.patel@example.com',
  },
};

function sendJson(response, statusCode, data) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
  });
  response.end(JSON.stringify(data, null, 2));
}

function collectRequestBody(request) {
  return new Promise((resolve, reject) => {
    let rawBody = '';

    request.on('data', (chunk) => {
      rawBody += chunk;
    });

    request.on('end', () => {
      if (!rawBody) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', reject);
  });
}

const server = http.createServer(async (request, response) => {
  const parsedUrl = new URL(request.url, `http://${request.headers.host}`);
  const { pathname } = parsedUrl;

  if (request.method === 'POST' && pathname === '/login') {
    try {
      const body = await collectRequestBody(request);
      const userId = body.userId || 'user-101';

      sendJson(response, 200, {
        message: 'Login successful',
        token: 'dummy-token-abc123',
        userId,
      });
    } catch (error) {
      sendJson(response, 400, {
        message: 'Invalid JSON request body',
      });
    }
    return;
  }

  if (request.method === 'GET' && pathname.startsWith('/user/')) {
    const userId = pathname.split('/')[2];
    const user = users[userId];

    if (!user) {
      sendJson(response, 404, {
        message: 'User not found',
      });
      return;
    }

    sendJson(response, 200, user);
    return;
  }

  sendJson(response, 404, {
    message: 'Route not found',
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
