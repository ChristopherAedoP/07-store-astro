/** @format */

//import GitHub from '@auth/core/providers/github';
import { defineConfig } from 'auth-astro';
import Credentials from '@auth/core/providers/credentials';
import { db, eq, User } from 'astro:db';
import bcrypt from 'bcryptjs';
import type { AdapterUser } from '@auth/core/adapters';

export default defineConfig({
	providers: [
		// GitHub({
		// 	clientId: import.meta.env.GITHUB_CLIENT_ID,
		// 	clientSecret: import.meta.env.GITHUB_CLIENT_SECRET,
		// }),

		Credentials({
			credentials: {
				email: { label: 'Correo', type: 'email' },
				password: { label: 'Contraseña', type: 'password' },
			},
			authorize: async ({ email, password }) => {
				const [user] = await db
					.select()
					.from(User)
					.where(eq(User.email, `${email}`));

				// console.log('user db', user);

				if (!user) {
					throw new Error('User not found');
				}
				// console.log('user.password  : ', user.password);
				// console.log('user.password b: ', bcrypt.hashSync(password as string));

				if (bcrypt.compareSync(password as string, user.password)) {
					throw new Error('Invalid password');
				}

				const { password: _, ...rest } = user;
				// console.log('user', rest);
				return rest;
			},
		}),
	],

	callbacks: {
		jwt: ({ token, user }) => {

			if (user) {
				token.user = user;
			}

			return token;
		},

		session: ({ session, token }) => {

			session.user = token.user as AdapterUser;
			console.log({ SessionUser: session.user });
			console.log({ session });
			return session;
		},
	},
});
