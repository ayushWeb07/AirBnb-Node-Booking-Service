import { Router } from "express";
import * as users from "../../controllers/users.controller.ts";

import {
	validateRequestBody,
	validateRequestUrlParams,
} from "../../validators/index.ts";

import {
	createSchema,
	getOneSchema,
	removeSchema,
	updateSchema,
} from "../../validators/users.validator.ts";

const router = Router();

router.get("/", users.getMany);
router.get("/:id", validateRequestUrlParams(getOneSchema), users.getOne);
router.post("/", validateRequestBody(createSchema), users.create);
router.put("/:id", validateRequestUrlParams(updateSchema), users.update);
router.delete("/:id", validateRequestUrlParams(removeSchema), users.remove);

export default router;
