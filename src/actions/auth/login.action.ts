/** @format */

import { defineAction } from 'astro:actions';
import { z } from 'astro:schema';

export const loginUser = defineAction({
	accept: 'form',
	input: z.object({
		email: z.string().email(),
		remember_me: z.boolean().optional(),
	}),
	handler: async ({ email, remember_me }, { cookies }) => {
		if (remember_me) {
			cookies.set('email', email, {
				expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365), //1 año
				path: '/',
			});
		} else {
			cookies.delete('email', {
				path: '/',
			});
		}

		return { ok: true };
	},
});
