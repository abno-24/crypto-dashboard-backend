import { Router, Request, Response } from "express";
import { getVolumeAndTransactions } from "../controllers/crypto.controller";

const router = Router();

router.get("/volume-and-transactions", (req: Request, res: Response) => {
  getVolumeAndTransactions(req, res);
});

export default router;
