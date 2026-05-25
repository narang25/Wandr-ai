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
        
        const freshTrip = await Trip.findById(trip._id);
        if (freshTrip) {
          freshTrip.itinerary = aiData.itinerary || [];
          freshTrip.budgetBreakdown = aiData.budgetBreakdown || {};
          freshTrip.hotels = aiData.hotels || [];
          freshTrip.quickFacts = aiData.quickFacts || {};
          freshTrip.status = 'ready';
          
          await freshTrip.save();
          console.log(`Trip ${trip._id} generated successfully`);
        }
      } catch (error) {
        console.error(`Background generation failed for trip ${trip._id}:`, error);
        await Trip.findByIdAndUpdate(trip._id, { status: 'error' });
      }
    })();
  } catch (error) {
    console.error('Generate trip error:', error);
    res.status(500).json({ error: 'Failed to start generation' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Itinerary Editing Endpoints
// ─────────────────────────────────────────────────────────────────────────────

// PUT /api/trips/:id/itinerary/remove - Remove an activity
router.put(
  '/:id/itinerary/remove',
  [
    body('dayIndex').isInt({ min: 0 }).withMessage('Valid day index is required'),
    body('activityId').isString().notEmpty().withMessage('Activity ID is required'),
  ],
  handleValidationErrors,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const trip = await Trip.findOne({
        _id: req.params.id,
        userId: req.user!.userId,
      });

      if (!trip) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }

      const { dayIndex, activityId } = req.body;

      if (!trip.itinerary[dayIndex]) {
        res.status(400).json({ error: 'Invalid day index' });
        return;
      }

      trip.itinerary[dayIndex].activities = trip.itinerary[dayIndex].activities.filter(
        (a: any) => a.id !== activityId
      );

      trip.markModified('itinerary');
      await trip.save();
      res.json({ trip });
    } catch (error) {
      console.error('Remove activity error:', error);
      res.status(500).json({ error: 'Failed to remove activity' });
    }
  }
);

// PUT /api/trips/:id/itinerary/add - Add a custom activity
router.put(
  '/:id/itinerary/add',
  [
    body('dayIndex').isInt({ min: 0 }).withMessage('Valid day index is required'),
    body('activity.name').isString().notEmpty().withMessage('Activity name is required'),
    body('activity.time').isString().notEmpty().withMessage('Activity time is required'),
  ],
  handleValidationErrors,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const trip = await Trip.findOne({
        _id: req.params.id,
        userId: req.user!.userId,
      });

      if (!trip) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }

      const { dayIndex, activity } = req.body;

      if (!trip.itinerary[dayIndex]) {
        res.status(400).json({ error: 'Invalid day index' });
        return;
      }

      const newActivity = {
        id: `custom-${Date.now()}`,
        time: activity.time,
        name: activity.name,
        description: activity.description || '',
        category: activity.category || 'Custom',
        estimatedCost: activity.estimatedCost || 0,
        location: activity.location || { lat: 0, lng: 0 },
      };

      trip.itinerary[dayIndex].activities.push(newActivity);

      // Sort activities by time
      trip.itinerary[dayIndex].activities.sort((a: any, b: any) =>
        a.time.localeCompare(b.time)
      );

      trip.markModified('itinerary');
      await trip.save();
      res.json({ trip });
    } catch (error) {
      console.error('Add activity error:', error);
      res.status(500).json({ error: 'Failed to add activity' });
    }
  }
);

// POST /api/trips/:id/regenerate-day - Regenerate a specific day using AI
router.post(
  '/:id/regenerate-day',
  generateLimiter,
  [
    body('dayNumber').isInt({ min: 1 }).withMessage('Valid day number is required'),
  ],
  handleValidationErrors,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const trip = await Trip.findOne({
        _id: req.params.id,
        userId: req.user!.userId,
      });

      if (!trip) {
        res.status(404).json({ error: 'Trip not found' });
        return;
      }

      const { dayNumber, instructions } = req.body;
      const dayIdx = dayNumber - 1;

      if (!trip.itinerary[dayIdx]) {
        res.status(400).json({ error: `Day ${dayNumber} does not exist` });
        return;
      }

      const regeneratePrompt = `You are an expert travel planner. Regenerate ONLY Day ${dayNumber} of a ${trip.days}-day trip to ${trip.destination}.

Budget Level: ${trip.budget}
Interests: ${trip.interests.join(', ')}
${instructions ? `Special Instructions: ${instructions}` : ''}

You MUST respond with ONLY a valid JSON object matching this exact structure:
{
  "day": ${dayNumber},
  "title": "Day title here",
  "activities": [
    {
      "id": "day${dayNumber}-act1",
      "time": "09:00",
      "name": "Activity Name",
      "description": "1-2 sentence description",
      "category": "Category",
      "estimatedCost": 0,
      "location": { "lat": 0.0, "lng": 0.0 }
    }
  ]
}

Provide 4-6 realistic activities with real coordinates for ${trip.destination}. Do not include markdown or conversational text.`;

      const groqKey = process.env.GROQ_API_KEY;
      if (!groqKey) {
        res.status(500).json({ error: 'AI service not configured' });
        return;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: 'You are a travel planner that outputs valid JSON only.' },
            { role: 'user', content: regeneratePrompt },
          ],
          temperature: 0.8,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate day from AI');
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);

      trip.itinerary[dayIdx] = parsed;
      trip.markModified('itinerary');
      await trip.save();

      res.json({ trip });
    } catch (error) {
      console.error('Regenerate day error:', error);
      res.status(500).json({ error: 'Failed to regenerate day' });
    }
  }
);

// DELETE /api/trips/:id - Delete a trip
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ error: 'Failed to delete trip' });
  }
});

// POST /api/trips/:id/duplicate - Duplicate a trip
router.post('/:id/duplicate', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const originalTrip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!originalTrip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    const duplicatedTrip = new Trip({
      userId: req.user!.userId,
      destination: originalTrip.destination,
      startDate: originalTrip.startDate,
      days: originalTrip.days,
      budget: originalTrip.budget,
      interests: originalTrip.interests,
      status: originalTrip.status,
      itinerary: originalTrip.itinerary,
      budgetBreakdown: originalTrip.budgetBreakdown,
      hotels: originalTrip.hotels,
      quickFacts: originalTrip.quickFacts,
    });

    await duplicatedTrip.save();
    res.status(201).json({ trip: duplicatedTrip });
  } catch (error) {
    console.error('Duplicate trip error:', error);
    res.status(500).json({ error: 'Failed to duplicate trip' });
  }
});

// POST /api/trips/:id/packing-list - Generate AI packing list
router.post('/:id/packing-list', generateLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
      res.status(500).json({ error: 'AI service not configured' });
      return;
    }

    const packingPrompt = `Generate a smart packing list for a ${trip.days}-day trip to ${trip.destination}.
Budget: ${trip.budget}
Interests: ${trip.interests.join(', ')}

You MUST respond with ONLY a valid JSON object matching this structure:
{
  "categories": [
    {
      "name": "Essentials",
      "emoji": "📋",
      "items": ["Passport", "Travel insurance docs", "Phone charger"]
    },
    {
      "name": "Clothing",
      "emoji": "👕",
      "items": ["Light jacket", "Comfortable shoes"]
    }
  ]
}

Include 5-7 categories with 4-8 items each. Categories should include: Essentials, Clothing, Toiletries, Electronics, and destination-specific items. Tailor the list to the destination's climate and the traveler's interests.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a travel assistant that outputs valid JSON only.' },
          { role: 'user', content: packingPrompt },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate packing list');
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    res.json({ packingList: parsed });
  } catch (error) {
    console.error('Packing list error:', error);
    res.status(500).json({ error: 'Failed to generate packing list' });
  }
});

// PUT /api/trips/:id/share - Toggle trip visibility
router.put('/:id/share', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user!.userId,
    });

    if (!trip) {
      res.status(404).json({ error: 'Trip not found' });
      return;
    }

    trip.isPublic = !trip.isPublic;
    await trip.save();
    
    res.json({ trip });
  } catch (error) {
    console.error('Share trip error:', error);
    res.status(500).json({ error: 'Failed to share trip' });
  }
});

export default router;

