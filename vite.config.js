import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import svgr from 'vite-plugin-svgr';

const readJsonBody = async (request) => {
    const chunks = [];

    for await (const chunk of request) {
        chunks.push(chunk);
    }

    const raw = Buffer.concat(chunks).toString('utf8');
    return raw ? JSON.parse(raw) : {};
};

const sendJson = (response, status, payload) => {
    response.statusCode = status;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    response.end(JSON.stringify(payload));
};

const handleKakaoExchange = async (body, env) => {
    const clientId = env.KAKAO_REST_API_KEY || env.VITE_KAKAO_REST_API_KEY;
    const clientSecret = env.KAKAO_CLIENT_SECRET || '';
    const { code, redirectUri } = body;

    if (!clientId) {
        return [500, { message: '서버에 KAKAO_REST_API_KEY가 설정되지 않았습니다.' }];
    }

    if (!code || !redirectUri) {
        return [400, { message: 'code와 redirectUri가 필요합니다.' }];
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

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
        body: tokenParams,
    });

    const tokenPayload = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenPayload.access_token) {
        return [
            tokenResponse.status || 500,
            {
                message:
                    tokenPayload.error_description ||
                    tokenPayload.error ||
                    '카카오 액세스 토큰 발급에 실패했습니다.',
            },
        ];
    }

    const userResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
        headers: {
            Authorization: `Bearer ${tokenPayload.access_token}`,
            'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
    });

    const userPayload = await userResponse.json();

    if (!userResponse.ok) {
        return [userResponse.status || 500, { message: '카카오 사용자 정보를 가져오지 못했습니다.' }];
    }

    return [200, { profile: userPayload }];
};

const handleNaverExchange = async (body, env) => {
    const clientId = env.NAVER_CLIENT_ID || env.VITE_NAVER_CLIENT_ID;
    const clientSecret = env.NAVER_CLIENT_SECRET || '';
    const { code, state } = body;

    if (!clientId || !clientSecret) {
        return [500, { message: '서버에 NAVER_CLIENT_ID 또는 NAVER_CLIENT_SECRET이 설정되지 않았습니다.' }];
    }

    if (!code || !state) {
        return [400, { message: 'code와 state가 필요합니다.' }];
    }

    const tokenUrl = new URL('https://nid.naver.com/oauth2.0/token');
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
        return [
            tokenResponse.status || 500,
            {
                message:
                    tokenPayload.error_description ||
                    tokenPayload.error ||
                    '네이버 액세스 토큰 발급에 실패했습니다.',
            },
        ];
    }

    const userResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
        headers: {
            Authorization: `Bearer ${tokenPayload.access_token}`,
        },
    });

    const userPayload = await userResponse.json();

    if (!userResponse.ok || userPayload?.resultcode === '024') {
        return [userResponse.status || 500, { message: '네이버 사용자 정보를 가져오지 못했습니다.' }];
    }

    return [200, { profile: userPayload }];
};

const localOAuthProxyPlugin = (env) => ({
    name: 'local-oauth-proxy',
    configureServer(server) {
        server.middlewares.use(async (request, response, next) => {
            if (request.method === 'OPTIONS' && request.url?.startsWith('/api/oauth/')) {
                response.statusCode = 204;
                response.setHeader('Access-Control-Allow-Origin', request.headers.origin || '*');
                response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
                response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
                response.end();
                return;
            }

            if (request.method !== 'POST') {
                next();
                return;
            }

            if (request.url !== '/api/oauth/kakao/exchange' && request.url !== '/api/oauth/naver/exchange') {
                next();
                return;
            }

            try {
                const body = await readJsonBody(request);
                const [status, payload] =
                    request.url === '/api/oauth/kakao/exchange'
                        ? await handleKakaoExchange(body, env)
                        : await handleNaverExchange(body, env);

                response.setHeader('Access-Control-Allow-Origin', request.headers.origin || '*');
                response.setHeader('Vary', 'Origin');
                sendJson(response, status, payload);
            } catch (error) {
                sendJson(response, 500, {
                    message: error instanceof Error ? error.message : 'OAuth 프록시 처리 중 오류가 발생했습니다.',
                });
            }
        });
    },
});

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    const manualChunks = (id) => {
        if (!id.includes('node_modules')) {
            return undefined;
        }

        if (id.includes('react-virtualized')) {
            return 'virtualized-vendor';
        }

        if (id.includes('@react-oauth/google')) {
            return 'oauth-vendor';
        }

        if (id.includes('react-router') || id.includes('@remix-run')) {
            return 'router-vendor';
        }

        if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('redux')) {
            return 'state-vendor';
        }

        if (id.includes('gsap')) {
            return 'gsap-vendor';
        }

        if (id.includes('framer-motion')) {
            return 'motion-vendor';
        }

        if (id.includes('lucide-react')) {
            return 'icon-vendor';
        }

        if (
            id.includes('@radix-ui') ||
            id.includes('@mui') ||
            id.includes('@mantine') ||
            id.includes('react-day-picker') ||
            id.includes('swiper') ||
            id.includes('sweetalert2')
        ) {
            return 'ui-vendor';
        }

        if (
            id.includes('react') ||
            id.includes('scheduler') ||
            id.includes('clsx') ||
            id.includes('class-variance-authority') ||
            id.includes('tailwind-merge')
        ) {
            return 'react-vendor';
        }

        return undefined;
    };

    return {
        plugins: [react(), svgr(), tailwindcss(), localOAuthProxyPlugin(env)],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks,
                },
            },
        },
    };
});
