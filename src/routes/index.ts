import express from "express";
import cryptoRoute from "./crypto.route";

const router = express.Router();

router.use("/crypto", cryptoRoute);

export default router;
