import { defineAction } from 'astro:actions';
import { db, User } from 'astro:db';
import { z } from 'astro:schema';
import bcrypt from 'bcryptjs';
import { v4 as UUID } from 'uuid';

export const registerUser = defineAction({
	accept: 'form',
	input: z.object({
		name: z.string().min(2),
		email: z.string().email(),
		password: z.string().min(2),
		remember_me: z.boolean().optional(),
	}),
	handler: async (input, context) => {
		const { name, email, password, remember_me } = input;
		const { cookies } = context;
    const saltRounds = 10;

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

		try {


        const salt = bcrypt.genSaltSync(saltRounds);
				const hash = bcrypt.hashSync(password, salt);

      	const newUser = {
					id: UUID(),
					name: name,
					email: email,
					password: hash,
					role: 'user',
				};

        console.log(newUser);
        
				const resp = await db.insert(User).values(newUser);
        console.log('resp', resp);
			// const user = await createUserWithEmailAndPassword(
			// 	firebase.auth,
			// 	email,
			// 	password
			// );

			//actualizar nombre
			// updateProfile(firebase.auth.currentUser!, {
			// 	displayName: name,
			// });

			//verificar correo electronico
			// await sendEmailVerification(firebase.auth.currentUser!, {
			// 	url: `${import.meta.env.WEBSITE_URL}/protected?emailVerified=true`,
			// });

			//return user;
			return { ok: true, msg: 'Usuario creado' };


		} catch (error) {
			console.log(error);

			// const firebaseError = error as AuthError;
			// if (firebaseError.code === 'auth/email-already-in-use') {
			// 	throw new Error('El correo ya esta en eso.');
			// }

			throw new Error('Error en crear al usuario.');
		}
	},
});
