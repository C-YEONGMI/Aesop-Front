import { fail, handleCors, readJsonBody, requirePost, success } from '../_shared.js';

const NAVER_TOKEN_ENDPOINT = 'https://nid.naver.com/oauth2.0/token';
const NAVER_USERINFO_ENDPOINT = 'https://openapi.naver.com/v1/nid/me';

export default async function handler(request, response) {
    if (handleCors(request, response)) {
        return;
    }

    if (!requirePost(request, response)) {
        return;
    }

    const body = await readJsonBody(request, response);

    if (!body) {
        return;
    }

    const { code, state } = body;
    const clientId = process.env.NAVER_CLIENT_ID || process.env.VITE_NAVER_CLIENT_ID;
    const clientSecret = process.env.NAVER_CLIENT_SECRET || '';

    if (!clientId || !clientSecret) {
        fail(response, 500, '서버에 NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다.');
        return;
    }

    if (!code || !state) {
        fail(response, 400, 'code와 state가 필요합니다.');
        return;
    }

    const tokenUrl = new URL(NAVER_TOKEN_ENDPOINT);
    tokenUrl.searchParams.set('grant_type', 'authorization_code');
    tokenUrl.searchParams.set('client_id', clientId);
    tokenUrl.searchParams.set('client_secret', clientSecret);
    tokenUrl.searchParams.set('code', code);
    tokenUrl.searchParams.set('state', state);

    const tokenResponse = await fetch(tokenUrl, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    });

    const tokenPayload = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenPayload.access_token) {
        fail(
            response,
            tokenResponse.status || 500,
            tokenPayload.error_description || tokenPayload.error || '네이버 액세스 토큰 발급에 실패했습니다.'
        );
        return;
    }

    const userResponse = await fetch(NAVER_USERINFO_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${tokenPayload.access_token}`,
        },
    });

    const userPayload = await userResponse.json();

    if (!userResponse.ok || userPayload?.resultcode === '024') {
        fail(response, userResponse.status || 500, '네이버 사용자 정보를 가져오지 못했습니다.');
        return;
    }

    success(response, { profile: userPayload });
}
