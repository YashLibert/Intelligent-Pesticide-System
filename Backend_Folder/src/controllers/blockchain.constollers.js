import { asyncHandler } from "../utils/asynicHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { blockchain } from "../utils/Blockchian.js";
import { Spray } from "../modals/spray.modals.js";
import { BlockRecord } from "../modals/Blockchain.modals.js";

// POST /api/v1/blockchain/add
export const addBlock = asyncHandler(async (req, res) => {
  const { farmerID, plantID, pesticideAmount, infectionLevel, location } = req.body;

  if (!farmerID || !plantID || !pesticideAmount) {
    throw new ApiError(400, "Missing required spray details");
  }

  // 1. Save spray event to DB
  const sprayEvent = await Spray.create({
    farmerID,
    plantID,
    pesticideAmount,
    infectionLevel,
    location
  });

  // 2. Evaluate compliance/rewards
  const rulesResult = evaluateRules({ pesticideAmount, infectionLevel });

  // 3. Add spray event into blockchain
  const newBlock = blockchain.addBlock({ sprayEvent, rulesResult });

  // 4. Save block in MongoDB for persistence
  await BlockRecord.create(newBlock);

  return res
    .status(201)
    .json(new ApiResponse(201, newBlock, "Spray event added to blockchain"));
});

// GET /api/v1/blockchain/ledger
export const getLedger = asyncHandler(async (req, res) => {
  const chain = blockchain.getChain();
  return res.json(new ApiResponse(200, chain, "Blockchain Ledger"));
});

// GET /api/v1/blockchain/validate
export const validateChain = asyncHandler(async (req, res) => {
  const valid = blockchain.isChainValid();
  return res.json(new ApiResponse(200, { valid }, valid ? "Chain Valid" : "Chain Invalid"));
});

// GET /api/v1/blockchain/block/:index
export const getBlockByIndex = asyncHandler(async (req, res) => {
  const index = Number(req.params.index);
  const block = blockchain.getBlockByIndex(index);
  if (!block) throw new ApiError(404, "Block Not Found");
  return res.json(new ApiResponse(200, block, "Block Found"));
});

// NEW: GET /api/v1/blockchain/rewards/:farmerId
export const getFarmerRewards = asyncHandler(async (req, res) => {
  const farmerId = req.params.farmerId;
  let totalRewards = 0;

  blockchain.getChain().forEach(block => {
    if (block.data?.sprayEvent?.farmerId == farmerId) {
      totalRewards += block.data.rulesResult?.reward || 0;
    }
  });

  return res.json(new ApiResponse(200, { farmerId, totalRewards }, "Rewards Calculated"));
});

// --- Helper Smart Contract Rules ---
function evaluateRules(event) {
  const result = { compliant: true, violation: [], reward: 0 };
  const MAX_ALLOWED = 50; // ml example

  if (event.pesticideAmount > MAX_ALLOWED) {
    result.compliant = false;
    result.violation.push(`pesticideAmount > ${MAX_ALLOWED}`);
  }

  // Reward logic based on infection level
  if (
    event.pesticideAmount &&
    event.infectionLevel &&
    event.pesticideAmount <= recommendedFromInfection(event.infectionLevel)
  ) {
    result.reward = 10; // 10 tokens
  }

  return result;
}

function recommendedFromInfection(infectionLevel) {
  if (!infectionLevel) return 0;
  if (infectionLevel < 0.2) return 10;
  if (infectionLevel < 0.5) return 30;
  return 60;
}
