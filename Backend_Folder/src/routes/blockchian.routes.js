import { Router } from "express";
import { addBlock, getLedger, validateChain, getBlockByIndex, getFarmerRewards } from "../controllers/blockchain.constollers.js";
import { verifyJWT } from "../middlewares/auth.middlewares.js";

const router = Router();

router.post("/add", verifyJWT, addBlock);
router.get("/ledger", verifyJWT, getLedger);
router.get("/validate", verifyJWT, validateChain);
router.get("/block/:index", verifyJWT, getBlockByIndex);
router.get("/rewards/:farmerId", verifyJWT, getFarmerRewards);

export default router;
