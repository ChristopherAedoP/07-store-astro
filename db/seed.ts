/** @format */

import { db, Role, User, Product, ProductImage } from 'astro:db';
import { v4 as UUID } from 'uuid';
import bcrypt from 'bcryptjs';
import { seedProducts } from './seed-data';

// https://astro.build/db/seed
export default async function seed() {
	const roles = [
		{ id: 'admin', name: 'Administrador' },
		{ id: 'user', name: 'usuario sistema' },
	];

	const shiro = {
		id: UUID(),
		name: 'Shiro',
		email: 'shiro@gmail.com',
		password: bcrypt.hashSync('123456'),
		role: 'admin',
	};

	const ushi = {
		id: UUID(),
		name: 'ushi',
		email: 'ushi@gmail.com',
		password: bcrypt.hashSync('123456'),
		role: 'user',
	};

	await db.insert(Role).values(roles);
	await db.insert(User).values([shiro, ushi]);

	const queries: any = [];

	seedProducts.forEach((p) => {
		const product = {
			id: UUID(),
			stock: p.stock,
			slug: p.slug,
			price: p.price,
			sizes: p.sizes.join(','),
			type: p.type,
			tags: p.tags.join(','),
			title: p.title,
			description: p.description,
			gender: p.gender,
			user: ushi.id,
		};

		queries.push(db.insert(Product).values(product));

		p.images.forEach( img => {
			const imagen = {
				id: UUID(),
				image: img,
				productId: product.id,
			};

			queries.push(db.insert(ProductImage).values(imagen));
		})

	});

	await db.batch(queries);
}
