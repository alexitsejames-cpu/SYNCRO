import { Router, Response } from 'express';
import { analyticsService } from '../services/analytics-service';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import logger from '../config/logger';

const router: Router = Router();

// All analytics routes require authentication
router.use(authenticate);

/**
 * GET /api/analytics/summary
 * Get spend analytics summary and trends
 */
router.get('/summary', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const summary = await analyticsService.getSummary(req.user!.id);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('Analytics summary error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics summary'
    });
  }
});

/**
 * GET /api/analytics/budgets
 * Get user budgets
 */
router.get('/budgets', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { data: budgets, error } = await (analyticsService as any).getUserBudgets(req.user!.id);
    if (error) throw error;
    res.json({ success: true, data: budgets });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch budgets' });
  }
});

/**
 * GET /api/analytics/spending
 * Get spending trends
 */
router.get('/spending', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const spending = await analyticsService.getSpending(req.user!.id);
    res.json({
      success: true,
      data: spending
    });
  } catch (error) {
    logger.error('Analytics spending error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch spending data'
    });
  }
});

/**
 * GET /api/analytics/forecast
 * Get spending forecast for next 6 months
 */
router.get('/forecast', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const forecast = await analyticsService.getForecast(req.user!.id);
    res.json({
      success: true,
      data: forecast
    });
  } catch (error) {
    logger.error('Analytics forecast error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch forecast data'
    });
  }
});

export default router;
