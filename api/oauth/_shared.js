const json = (response, status, payload) => {
    response.statusCode = status;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(JSON.stringify(payload));
};

const readBody = async (request) => {
    if (request.body && typeof request.body === 'object') {
        return request.body;
    }

    if (typeof request.body === 'string') {
        return request.body ? JSON.parse(request.body) : {};
    }

    const chunks = [];

    for await (const chunk of request) {
        chunks.push(chunk);
    }

    const raw = Buffer.concat(chunks).toString('utf8');
    return raw ? JSON.parse(raw) : {};
};

export const handleCors = (request, response) => {
    const origin = request.headers.origin || '*';
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        response.statusCode = 204;
        response.end();
        return true;
    }

    return false;
};

export const requirePost = (request, response) => {
    if (request.method !== 'POST') {
        json(response, 405, { message: 'POST 요청만 허용됩니다.' });
        return false;
    }

    return true;
};

export const readJsonBody = async (request, response) => {
    try {
        return await readBody(request);
    } catch {
        json(response, 400, { message: '요청 본문을 읽지 못했습니다.' });
        return null;
    }
};

export const fail = (response, status, message) => json(response, status, { message });

export const success = (response, payload) => json(response, 200, payload);
