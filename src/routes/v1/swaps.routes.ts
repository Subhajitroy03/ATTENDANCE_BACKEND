import { Router } from "express";

import {
	createSwapController,
	deleteSwapController,
	getSwapByIdController,
	getSwapsController,
	updateSwapController,
} from "../../controllers/swaps.controller.js";

const swapsRouter = Router();

swapsRouter.post("/", createSwapController);
swapsRouter.get("/", getSwapsController);
swapsRouter.get("/:id", getSwapByIdController);
swapsRouter.patch("/:id", updateSwapController);
swapsRouter.delete("/:id", deleteSwapController);

export default swapsRouter;
