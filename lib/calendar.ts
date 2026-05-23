import { createEvents, EventAttributes } from 'ics';
import { Trip, DayPlan, Activity } from './types';

export function downloadTripCalendar(trip: Trip) {
  if (!trip.startDate) {
    console.error("Trip missing start date");
    return;
  }

  const events: EventAttributes[] = [];
  const start = new Date(trip.startDate);

  trip.itinerary.forEach((day: DayPlan) => {
    day.activities.forEach((activity: Activity) => {
      // Parse time (e.g., "14:00")
      const [hours, minutes] = activity.time.split(':').map(Number);
      
      const eventDate = new Date(start);
      eventDate.setDate(eventDate.getDate() + (day.day - 1));
      
      const year = eventDate.getFullYear();
      const month = eventDate.getMonth() + 1; // 1-indexed
      const date = eventDate.getDate();

      events.push({
        title: activity.name,
        description: activity.description,
        location: trip.destination, // Optional: Can use lat/lng if supported, or just destination string
        start: [year, month, date, hours || 9, minutes || 0],
        duration: { hours: 2 }, // Default 2 hours per activity
        geo: activity.location ? { lat: activity.location.lat, lon: activity.location.lng } : undefined,
      });
    });
  });

  createEvents(events, (error, value) => {
    if (error) {
      console.error(error);
      return;
    }

    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${trip.destination.replace(/\\s+/g, '_')}_Itinerary.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}
