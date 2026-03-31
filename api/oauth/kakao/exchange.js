import { fail, handleCors, readJsonBody, requirePost, success } from '../_shared.js';

const KAKAO_TOKEN_ENDPOINT = 'https://kauth.kakao.com/oauth/token';
const KAKAO_USERINFO_ENDPOINT = 'https://kapi.kakao.com/v2/user/me';

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

    const { code, redirectUri } = body;
    const clientId = process.env.KAKAO_REST_API_KEY || process.env.VITE_KAKAO_REST_API_KEY;
    const clientSecret = process.env.KAKAO_CLIENT_SECRET || '';

    if (!clientId) {
        fail(response, 500, '서버에 KAKAO_REST_API_KEY가 설정되지 않았습니다.');
        return;
    }

    if (!code || !redirectUri) {
        fail(response, 400, 'code와 redirectUri가 필요합니다.');
        return;
    }

    const tokenParams = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        redirect_uri: redirectUri,
        code,
    });

    if (clientSecret) {
        tokenParams.set('client_secret', clientSecret);
    }

    const tokenResponse = await fetch(KAKAO_TOKEN_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: tokenParams,
    });

    const tokenPayload = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenPayload.access_token) {
        fail(
            response,
            tokenResponse.status || 500,
            tokenPayload.error_description || tokenPayload.error || '카카오 액세스 토큰 발급에 실패했습니다.'
        );
        return;
    }

    const userResponse = await fetch(KAKAO_USERINFO_ENDPOINT, {
        headers: {
            Authorization: `Bearer ${tokenPayload.access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
    });

    const userPayload = await userResponse.json();

    if (!userResponse.ok) {
        fail(response, userResponse.status || 500, '카카오 사용자 정보를 가져오지 못했습니다.');
        return;
    }

    success(response, { profile: userPayload });
}
