/** @format */

import { ImageUpload } from '@/utils/image-upload';
import { defineAction } from 'astro:actions';
import { db, eq, Product, ProductImage } from 'astro:db';
import { optional, z } from 'astro:schema';
import { getSession } from 'auth-astro/server';
import { v4 as UUID } from 'uuid';

const MAX_FILE_SIZE = 5_000_000; //5MB
const ACCEPTED_IMAGE_TYPES = [
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/webp',
	'image/svg+xml',
];

export const createUpdateProduct = defineAction({
	accept: 'form',
	input: z.object({
		id: z.string().optional(),
		stock: z.number(),
		slug: z.string(),
		price: z.number(),
		sizes: z.string(),
		type: z.string(),
		tags: z.string(),
		title: z.string(),
		description: z.string(),
		gender: z.string(),

		imageFiles: z
			.array(
				z
					.instanceof(File)
					.refine((file) => file.size <= MAX_FILE_SIZE, 'Max image size 5MB')
					.refine((file) => {
						if (file.size === 0) return true;
						return ACCEPTED_IMAGE_TYPES.includes(file.type);
					}, `Only suppored image files are valid, ${ACCEPTED_IMAGE_TYPES.join(',')}`)
			)
			.optional(),
	}),
	handler: async (form, { request }) => {
		const session = await getSession(request);
		const user = session?.user;

		if (!user) {
			throw new Error('Unautorize');
		}
		//console.log('user', user);

		const { id = UUID(), imageFiles, ...rest } = form;
		rest.slug = rest.slug.toLowerCase().replaceAll(' ', '-').trim();

		const product = {
			id: id,
			user: user.id!,
			...rest,
		};
		//console.log({ product });

		const queries: any = [];

		if (!form.id) {
			//crear
			queries.push(db.insert(Product).values(product));
		} else {
			//update
			queries.push(db.update(Product).set(product).where(eq(Product.id, id)));
		}

		//insert de imagen
		// imageFiles?.forEach(async (imageFile) => {
		// 	if (imageFile.size <= 0) return;
		// 	await ImageUpload.upload(imageFile);
		// });
		const secureUrls: string[] = [];
		if (
			form.imageFiles &&
			form.imageFiles.length > 0 &&
			form.imageFiles[0].size > 0
		) {
			const urls = await Promise.all(
				form.imageFiles.map((file) => ImageUpload.upload(file))
			);

			secureUrls.push(...urls);
		}

		secureUrls.forEach((imageUrl) => {
			const imageObj = {
				id: UUID(),
				image: imageUrl,
				productId: product.id,
			};

			queries.push(db.insert(ProductImage).values(imageObj))
		});

		await db.batch(queries);

		return product;
	},
});
