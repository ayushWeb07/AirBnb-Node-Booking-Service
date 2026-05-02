import z from "zod";

const getOneSchema = z.object({
	id: z.uuid(),
});

const createSchema = z.object({
	name: z.string().min(1).max(5),
});

const updateSchema = z.object({
	id: z.uuid(),
});

const removeSchema = z.object({
	id: z.uuid(),
});

export { getOneSchema, createSchema, updateSchema, removeSchema };
