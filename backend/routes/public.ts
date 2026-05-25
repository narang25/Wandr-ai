import { Router, Request, Response } from 'express';
import { Trip } from '../models/Trip';

const router = Router();

// GET /api/public/trips/:id - Get a public trip
router.get('/trips/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      isPublic: true,
    });
    
    if (!trip) {
      res.status(404).json({ error: 'Trip not found or is not public' });
      return;
    }
    
    res.json({ trip });
  } catch (error) {
    console.error('Get public trip error:', error);
    res.status(500).json({ error: 'Failed to fetch public trip' });
  }
});

export default router;
