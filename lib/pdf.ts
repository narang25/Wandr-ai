import { jsPDF } from 'jspdf';
import { Trip, DayPlan, Activity } from './types';

export function downloadTripPDF(trip: Trip) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (height: number) => {
    if (y + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ── Title ──
  doc.setFillColor(2, 4, 10); // void
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(0, 229, 255); // primary
  doc.text('Wandr.ai', margin, 20);

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // muted
  doc.text('AI-Powered Travel Planner', margin, 28);

  doc.setFontSize(22);
  doc.setTextColor(248, 250, 252); // bright
  doc.text(trip.destination, margin, 42);

  y = 60;

  // ── Trip Overview ──
  doc.setFillColor(10, 16, 28); // card
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');

  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  const overviewItems = [
    `Duration: ${trip.days} Days`,
    `Budget: ${trip.budget}`,
    `Interests: ${trip.interests.join(', ')}`,
  ];
  if (trip.startDate) {
    overviewItems.unshift(`Start Date: ${new Date(trip.startDate).toLocaleDateString()}`);
  }
  
  doc.setFont('helvetica', 'normal');
  overviewItems.forEach((item, i) => {
    doc.text(item, margin + 6, y + 8 + i * 7);
  });
  y += 40;

  // ── Budget Breakdown ──
  if (trip.budgetBreakdown) {
    addPageIfNeeded(50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(139, 92, 246); // violet
    doc.text('Budget Breakdown', margin, y);
    y += 10;

    doc.setFillColor(10, 16, 28);
    doc.roundedRect(margin, y, contentWidth, 40, 3, 3, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(248, 250, 252);

    const budgetItems = [
      { label: 'Flights', value: trip.budgetBreakdown.flights },
      { label: 'Accommodation', value: trip.budgetBreakdown.accommodation },
      { label: 'Food', value: trip.budgetBreakdown.food },
      { label: 'Activities', value: trip.budgetBreakdown.activities },
      { label: 'Transport', value: trip.budgetBreakdown.transport },
    ];

    budgetItems.forEach((item, i) => {
      const x = margin + 6 + (i % 3) * (contentWidth / 3);
      const row = Math.floor(i / 3);
      doc.setTextColor(148, 163, 184);
      doc.text(item.label, x, y + 10 + row * 16);
      doc.setTextColor(248, 250, 252);
      doc.setFont('helvetica', 'bold');
      doc.text(`$${(item.value || 0).toLocaleString()}`, x, y + 17 + row * 16);
      doc.setFont('helvetica', 'normal');
    });

    // Total
    doc.setFontSize(12);
    doc.setTextColor(0, 229, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${(trip.budgetBreakdown.total || 0).toLocaleString()}`, margin + contentWidth - 50, y + 35);
    doc.setFont('helvetica', 'normal');

    y += 50;
  }

  // ── Itinerary ──
  if (trip.itinerary && trip.itinerary.length > 0) {
    trip.itinerary.forEach((day: DayPlan) => {
      addPageIfNeeded(30);

      // Day header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 229, 255);
      doc.text(`Day ${day.day}`, margin, y);

      doc.setTextColor(248, 250, 252);
      doc.setFontSize(12);
      doc.text(day.title || '', margin + 30, y);
      y += 8;

      // Activities
      day.activities?.forEach((activity: Activity) => {
        addPageIfNeeded(22);

        doc.setFillColor(10, 16, 28);
        doc.roundedRect(margin + 4, y, contentWidth - 4, 18, 2, 2, 'F');

        // Time
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(0, 229, 255);
        doc.text(activity.time || '', margin + 8, y + 7);

        // Name
        doc.setTextColor(248, 250, 252);
        doc.setFontSize(10);
        doc.text(activity.name, margin + 30, y + 7);

        // Cost
        if (activity.estimatedCost > 0) {
          doc.setTextColor(251, 191, 36); // gold
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`$${activity.estimatedCost}`, margin + contentWidth - 20, y + 7);
        }

        // Description
        if (activity.description) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          doc.setTextColor(148, 163, 184);
          const lines = doc.splitTextToSize(activity.description, contentWidth - 40);
          doc.text(lines.slice(0, 2), margin + 30, y + 13);
        }

        y += 20;
      });

      y += 6;
    });
  }

  // ── Hotels ──
  if (trip.hotels && trip.hotels.length > 0) {
    addPageIfNeeded(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(139, 92, 246);
    doc.text('Recommended Hotels', margin, y);
    y += 10;

    trip.hotels.forEach((hotel) => {
      addPageIfNeeded(24);

      doc.setFillColor(10, 16, 28);
      doc.roundedRect(margin, y, contentWidth, 20, 2, 2, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(248, 250, 252);
      doc.text(`${hotel.emoji || '🏨'} ${hotel.name}`, margin + 6, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(148, 163, 184);
      doc.text(`${hotel.tier} · $${hotel.pricePerNight}/night · ⭐ ${hotel.rating}`, margin + 6, y + 15);

      y += 24;
    });
  }

  // ── Footer ──
  const totalPages = doc.internal.pages.length - 1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Generated by Wandr.ai · Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save
  const fileName = `${trip.destination.replace(/\s+/g, '_')}_Itinerary.pdf`;
  doc.save(fileName);
}
