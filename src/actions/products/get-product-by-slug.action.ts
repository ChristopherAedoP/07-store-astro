/** @format */

import { defineAction } from 'astro:actions';
import { db, eq, Product, ProductImage } from 'astro:db';
import { z } from 'astro:schema';

// const newProduct = {
// 	id:'',
// 	description: '',
// 	stock: 0,
// 	price: 0,
// 	sizes: '',
// 	slug: '',
// 	tags: '',
// 	title: '',
// 	type: '',
// 	gender: '',
// };

//pruebas
const newProduct = {
	id: '',
	description: 'nueva descripcion',
	stock: 5,
	price: 100,
	sizes: 'XL,L',
	slug: 'nuevo-producto',
	tags: 'nuevo,men',
	title: 'Nuevo Producto',
	type: 'shirts',
	gender: 'men',
};
export const getProductBySlug = defineAction({
	accept: 'json',
	input: z.string(),
	handler: async (slug) => {

		if(slug=== 'new'){
			return {
				product: newProduct,
				images: []
			}
		}

		const [product] = await db
			.select()
			.from(Product)
			.where(eq(Product.slug, slug));

		if (!product) {
			throw new Error(`Product with slug ${slug} not found`);
		}

        const images = await db
					.select()
					.from(ProductImage)
					.where(eq(ProductImage.productId, product.id));

		return {
			product: product,
			//images: images.map((i) => i.image)
			images: images,
		};
	},
});
