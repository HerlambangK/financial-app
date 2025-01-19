import { PrismaClient } from '@prisma/client';
import { defineEventHandler, readBody } from 'h3';

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
	if (event.node.req.method === 'POST') {
		const body = await readBody(event);
		if (
			!body ||
			!body.name ||
			body.quantity === null ||
			body.sellingPrice === null ||
			body.buyingPrice === null
		) {
			return { error: 'Data tidak lengkap' };
		}

		const transaction = await prisma.transaction.create({
			data: {
				name: body.name,
				quantity: body.quantity,
				sellingPrice: body.sellingPrice,
				buyingPrice: body.buyingPrice,
				type: body.type,
			},
		});
		return transaction;
	} else if (event.node.req.method === 'GET') {
		const transactions = await prisma.transaction.findMany();
		return transactions;
	}
});
