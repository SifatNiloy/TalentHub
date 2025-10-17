import { Router } from "express";
import {
  createUserHandler,
  getUserHandler,
  getAllUsersHandler,
  updateUserHandler,
  deleteUserHandler,
} from "../controllers/user.controller";
import validateResource from "../middleware/validateresource";
import { createUserSchema, updateUserSchema } from "../schema/user.schema";
import asyncWrapper from "../utils/async-wrapper";

const router = Router();

router.post("/create", validateResource(createUserSchema), asyncWrapper(createUserHandler));
router.get("/:id", asyncWrapper(getUserHandler));
router.get("/", asyncWrapper(getAllUsersHandler));
router.patch("/:id", validateResource(updateUserSchema), asyncWrapper(updateUserHandler));
router.delete("/:id", asyncWrapper(deleteUserHandler));

export default router;
