import { getToken } from '@auth/core/jwt';
import { getContext } from 'hono/context-storage';

export default function CreateAuth() {
	const auth = async () => {
		const c = getContext();
		const authUrl = process.env.AUTH_URL ?? process.env.NEXT_PUBLIC_CREATE_BASE_URL ?? 'http://localhost:4000';
		const token = await getToken({
			req: c.req.raw,
			secret: process.env.AUTH_SECRET ?? 'dev-auth-secret-change-me',
			secureCookie: authUrl.startsWith('https'),
		});
		if (token) {
			return {
				user: {
					id: token.sub,
					email: token.email,
					name: token.name,
					image: token.picture,
				},
				expires: token.exp.toString(),
			};
		}
	};
	return {
		auth,
	};
}
