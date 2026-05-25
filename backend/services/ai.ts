import { ITrip } from '../models/Trip';

export async function generateItinerary(trip: ITrip): Promise<any> {
  const wandrAiGroqKey = process.env.GROQ_API_KEY;
  if (!wandrAiGroqKey) {
    throw new Error('GROQ_API_KEY is not configured');
  }

  const prompt = `You are an expert travel planner. Create a highly detailed and personalized travel itinerary for the following trip:

Destination: ${trip.destination}
Duration: ${trip.days} days
Budget Level: ${trip.budget}
Interests: ${trip.interests.join(', ')}

You MUST respond with ONLY a valid JSON object matching the exact structure below. Do not include markdown formatting like \`\`\`json or any conversational text.

{
  "itinerary": [
    {
      "day": 1,
      "title": "Arrival & Orientation",
      "activities": [
        {
          "id": "day1-act1",
          "time": "14:00",
          "name": "Check-in at Hotel",
          "description": "Arrive and settle into your accommodation.",
          "category": "Logistics",
          "estimatedCost": 0,
          "location": {
            "lat": 48.8566,
            "lng": 2.3522
          }
        }
      ]
    }
  ],
  "budgetBreakdown": {
    "flights": 500,
    "accommodation": 400,
    "food": 300,
    "activities": 200,
    "transport": 100,
    "total": 1500
  },
  "hotels": [
    {
      "name": "Example Hotel",
      "tier": "${trip.budget}",
      "pricePerNight": 150,
      "rating": 4.5,
      "amenities": ["Pool", "WiFi", "Breakfast"],
      "description": "A wonderful stay in the heart of the city.",
      "emoji": "🏨"
    }
  ],
  "quickFacts": {
    "bestTimeToVisit": "Spring or Fall",
    "currency": "USD",
    "currencySymbol": "$",
    "language": "English",
    "timezone": "UTC-5",
    "location": {
      "lat": 48.8566,
      "lng": 2.3522
    }
  }
}

Ensure the itinerary has exactly ${trip.days} days. Generate realistic, detailed activities and costs suited for a ${trip.budget} budget.
CRITICAL INSTRUCTION: You MUST provide realistic "lat" and "lng" coordinates for the destination (in quickFacts.location) AND for every single activity (in activity.location). Do not leave them blank or omit them.
`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${wandrAiGroqKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: 'You are a helpful travel assistant that outputs valid JSON only.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API Error:', errorText);
    throw new Error('Failed to generate itinerary from Groq API');
  }

  const data = await response.json();
  try {
    const generatedContent = data.choices[0].message.content;
    const parsed = JSON.parse(generatedContent);
    return parsed;
  } catch (err) {
    console.error('JSON Parse Error:', err);
    throw new Error('Failed to parse itinerary JSON');
  }
}
