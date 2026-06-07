import atsAnalyticsService from '../services/ats-analytics.service';
export const getDashboardMetrics = async (req, res) => {
    try {
        const metrics = await atsAnalyticsService.getDashboardMetrics();
        res.json({ data: metrics });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//# sourceMappingURL=ats-analytics.controller.js.map