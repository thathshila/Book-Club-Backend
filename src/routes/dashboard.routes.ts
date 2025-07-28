import express from 'express';
import { getDashboardCounts } from '../utils/dashboardCounts';

const dashboardRouter = express.Router();

dashboardRouter.get('/counts', async (req, res) => {
    try {
        const counts = await getDashboardCounts();
        res.json(counts);
    } catch (error) {
        console.error('Error fetching dashboard counts:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

export default dashboardRouter;