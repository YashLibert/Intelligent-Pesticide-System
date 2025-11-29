import { SprayEvent } from "../modals/sprayEvent.modals.js";
import { blockchain } from "../utils/Blockchian.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynicHandler.js";

// POST /api/v1/spray/add
export const addSprayEvent = asyncHandler(async (req, res) => {
  const { plantId, diseaseDetected, infectionLevel, pesticideAmount } = req.body;
  if (!plantId || !diseaseDetected || !pesticideAmount) {
    throw new ApiError(400, "Missing spray details");
  }

  // compliance logic
  const MAX_ALLOWED = 50;
  let compliance = pesticideAmount <= MAX_ALLOWED;
  let rewardTokens = compliance ? 10 : 0;

  // Add to blockchain
  const blockData = { farmer: req.user._id, plantId, diseaseDetected, infectionLevel, pesticideAmount, compliance, rewardTokens };
  const block = blockchain.addBlock(blockData);

  // Save in DB
  const sprayEvent = await SprayEvent.create({
    farmer: req.user._id,
    plant: plantId,
    diseaseDetected,
    infectionLevel,
    pesticideAmount,
    compliance,
    rewardTokens,
    blockchainHash: block.hash
  });

  return res.status(201).json(new ApiResponse(201, sprayEvent, "Spray Event Recorded"));
});

// GET /api/v1/spray/my
export const getMySprays = asyncHandler(async (req, res) => {
  const sprays = await SprayEvent.find({ farmer: req.user._id })
    .populate("plant")   // populate plant info
    .populate("farmer", "username email"); 

  return res.json(new ApiResponse(200, sprays, "Fetched spray history"));
});

// GET /api/v1/spray/rewards
export const getMyRewards = asyncHandler(async (req, res) => {
  const result = await SprayEvent.aggregate([
    { $match: { farmer: req.user._id } },
    { $group: { _id: "$farmer", totalRewards: { $sum: "$rewardTokens" } } }
  ]);

  const totalRewards = result[0]?.totalRewards || 0;
  return res.json(new ApiResponse(200, { totalRewards }, "Reward balance fetched"));
});
