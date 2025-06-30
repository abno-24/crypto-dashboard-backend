import express from "express";
import cryptoRoute from "./crypto.route";
import healthRoute from "./health.route";

const router = express.Router();

router.use("/crypto", cryptoRoute);
router.use("/health", healthRoute);

export default router;
