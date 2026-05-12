const http = require('http');
const crypto = require('crypto');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '127.0.0.1';
const JWT_SECRET = process.env.JWT_SECRET || 'sample-jwt-secret';

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

function extractUserUpdates(body) {
  const allowedFields = ['firstName', 'lastName', 'email'];
  const updates = {};

  for (const field of allowedFields) {
    if (typeof body[field] === 'string' && body[field].trim() !== '') {
      updates[field] = body[field].trim();
    }
  }

  return updates;
}

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - (normalized.length % 4)) % 4);

  return Buffer.from(`${normalized}${padding}`, 'base64').toString('utf8');
}

function jwtAuthMiddleware(request, response) {
  const authHeader = request.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    sendJson(response, 401, {
      message: 'Missing or invalid Authorization header',
    });
    return null;
  }

  const token = authHeader.slice('Bearer '.length).trim();
  const tokenParts = token.split('.');

  if (tokenParts.length !== 3) {
    sendJson(response, 401, {
      message: 'Invalid JWT token',
    });
    return null;
  }

  const [encodedHeader, encodedPayload, providedSignature] = tokenParts;

  let header;
  let payload;

  try {
    header = JSON.parse(decodeBase64Url(encodedHeader));
    payload = JSON.parse(decodeBase64Url(encodedPayload));
  } catch (error) {
    sendJson(response, 401, {
      message: 'Invalid JWT token',
    });
    return null;
  }

  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    sendJson(response, 401, {
      message: 'Unsupported JWT token',
    });
    return null;
  }

  const expectedSignature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  const signatureBuffer = Buffer.from(providedSignature);
  const expectedSignatureBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedSignatureBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedSignatureBuffer)
  ) {
    sendJson(response, 401, {
      message: 'Invalid JWT signature',
    });
    return null;
  }

  if (typeof payload.exp === 'number' && Date.now() >= payload.exp * 1000) {
    sendJson(response, 401, {
      message: 'JWT token expired',
    });
    return null;
  }

  return payload;
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

  if (request.method === 'PATCH' && pathname.startsWith('/user/')) {
    if (!jwtAuthMiddleware(request, response)) {
      return;
    }

    const userId = pathname.split('/')[2];
    const user = users[userId];

    if (!user) {
      sendJson(response, 404, {
        message: 'User not found',
      });
      return;
    }

    try {
      const body = await collectRequestBody(request);
      const updates = extractUserUpdates(body);

      if (Object.keys(updates).length === 0) {
        sendJson(response, 400, {
          message: 'Provide at least one valid field: firstName, lastName, or email',
        });
        return;
      }

      users[userId] = {
        ...user,
        ...updates,
      };

      sendJson(response, 200, {
        message: 'User updated successfully',
        user: users[userId],
      });
    } catch (error) {
      sendJson(response, 400, {
        message: 'Invalid JSON request body',
      });
    }
    return;
  }

  if (request.method === 'GET' && pathname.startsWith('/user/')) {
    if (!jwtAuthMiddleware(request, response)) {
      return;
    }

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
