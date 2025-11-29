import { BlockRecord } from "../modals/Blockchain.modals.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getDashboardSummery = async(req, res) => {
    try {
        const totalSprays = await BlockRecord.countDocuments();
        const blocks = await BlockRecord.find();

        const compliant = blocks.filter(b => b.data?.rulersResult?.compliant).length;
        const complianceRate = totalSprays > 0 ? (compliant / totalSprays) * 100: 0;

        const totalRewards = blocks.reduce((sum, b) => sum + (b.data?. rulersResult?.reward || 0), 0 )
        const latestDetections = blocks.slice(-5);

        return res.json(new ApiResponse(200, {
            totalSprays,
            complianceRate,
            totalRewards,
            latestDetections
        }, "Dashboard Summary"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Failed To Fetch Summary"));
    };
}