import { Router, Response } from 'express';
import { body } from 'express-validator';
import { Trip } from '../models/Trip';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { handleValidationErrors } from '../utils/validation';
import { generateItinerary } from '../services/ai';
import { generateLimiter } from '../middleware/rateLimiter';

const router = Router();

// All trip routes require authentication
router.use(authenticateToken);

// POST /api/trips - Create a new trip
router.post(
  '/',
  [
    body('destination').isString().notEmpty().withMessage('Destination is required'),
    body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
    body('days').isInt({ min: 1, max: 21 }).withMessage('Days must be between 1 and 21'),
    body('budget').isIn(['Budget', 'Mid-Range', 'Luxury']).withMessage('Invalid budget tier'),
    body('interests').isArray({ min: 1 }).withMessage('At least one interest is required'),
  ],
  handleValidationErrors,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { destination, startDate, days, budget, interests } = req.body;

      const trip = new Trip({
        userId: req.user!.userId,
        destination,
        startDate,
        days,
        budget,
        interests,
        status: 'pending',
      });
      await trip.save();
      res.status(201).json({ trip });
    } catch (error) {
      console.error('Create trip error:', error);
      res.status(500).json({ error: 'Failed to create trip' });
    }
  }
);

// GET /api/trips - Get all trips for the current user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trips = await Trip.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ trips });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ error: 'Failed to fetch trips' });
  }
});

// GET /api/trips/:id - Get a specific trip
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    
    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }
    
    res.json({ trip });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ error: 'Failed to fetch trip' });
  }
});

// POST /api/trips/:id/generate - Trigger AI generation
router.post('/:id/generate', generateLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });
    
    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    if (trip.status === 'generating') {
      res.json({ message: 'Trip is already generating', trip });
      return;
    }

    // Set status to generating and return immediately so client can show loading screen
    trip.status = 'generating';
    await trip.save();
    res.json({ message: 'Generation started', trip });

    // Background process for AI generation
    (async () => {
      try {
        const aiData = await generateItinerary(trip);
        
        trip.itinerary = aiData.itinerary || [];
        trip.budgetBreakdown = aiData.budgetBreakdown || {};
        trip.hotels = aiData.hotels || [];
        trip.quickFacts = aiData.quickFacts || {};
        trip.status = 'ready';
        
        await trip.save();
        console.log(`Trip ${trip._id} generated successfully`);
      } catch (error) {
        console.error(`Background generation failed for trip ${trip._id}:`, error);
        trip.status = 'error';
        await trip.save();
      }
    })();
  } catch (error) {
    console.error('Generate trip error:', error);
    res.status(500).json({ error: 'Failed to start generation' });
  }
});

export default router;
