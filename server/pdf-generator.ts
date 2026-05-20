import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  meals: string[];
  notes: string;
}

interface Hotel {
  name: string;
  type: string;
  pricePerNight: string;
  highlights: string[];
  location: string;
}

interface BudgetAllocation {
  accommodation: number;
  food: number;
  transport: number;
  activities: number;
  contingency: number;
}

interface TripPDFData {
  destination: string;
  duration: number;
  budget: number;
  itinerary: ItineraryDay[];
  hotels: Hotel[];
  localFood: string[];
  attractions: string[];
  weatherOverview: string;
  budgetAllocation: BudgetAllocation;
}

/**
 * Generate a PDF document for a trip plan
 * Uses jsPDF to create a professional, dark-themed PDF with itinerary and budget breakdown
 */
export async function generateTripPDF(data: TripPDFData): Promise<Buffer> {
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Set colors for dark theme (as tuples for TypeScript compatibility)
  const darkBg: [number, number, number] = [20, 20, 20]; // Dark background
  const lightText: [number, number, number] = [240, 240, 240]; // Light text
  const accentColor: [number, number, number] = [255, 255, 255]; // White accent
  const mutedText: [number, number, number] = [160, 160, 160]; // Muted text

  let yPosition = 20;

  // Header with destination
  pdf.setFillColor(darkBg[0], darkBg[1], darkBg[2]);
  pdf.rect(0, 0, 210, 40, "F");

  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.setFontSize(28);
  pdf.setFont("helvetica", "bold");
  pdf.text(data.destination.toUpperCase(), 20, 20);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
  pdf.text(`${data.duration} DAYS | BUDGET: RM ${data.budget.toLocaleString()}`, 20, 32);

  yPosition = 50;

  // Weather Overview Section
  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("WEATHER & CONDITIONS", 20, yPosition);

  pdf.setDrawColor(mutedText[0], mutedText[1], mutedText[2]);
  pdf.line(20, yPosition + 2, 190, yPosition + 2);

  yPosition += 12;
  pdf.setTextColor(lightText[0], lightText[1], lightText[2]);
  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  const weatherLines = pdf.splitTextToSize(data.weatherOverview, 170);
  pdf.text(weatherLines, 20, yPosition);
  yPosition += weatherLines.length * 5 + 10;

  // Itinerary Section
  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("ITINERARY", 20, yPosition);

  pdf.setDrawColor(mutedText[0], mutedText[1], mutedText[2]);
  pdf.line(20, yPosition + 2, 190, yPosition + 2);

  yPosition += 12;

  for (const day of data.itinerary) {
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage();
      yPosition = 20;
    }

    // Day header
    pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    pdf.text(`DAY ${day.day}: ${day.title}`, 20, yPosition);
    yPosition += 8;

    // Activities
    if (day.activities.length > 0) {
      pdf.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Activities:", 25, yPosition);
      yPosition += 5;

      pdf.setTextColor(lightText[0], lightText[1], lightText[2]);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      for (const activity of day.activities) {
        const activityLines = pdf.splitTextToSize(`• ${activity}`, 165);
        pdf.text(activityLines, 30, yPosition);
        yPosition += activityLines.length * 4;
      }
      yPosition += 2;
    }

    // Meals
    if (day.meals.length > 0) {
      pdf.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Meals:", 25, yPosition);
      yPosition += 5;

      pdf.setTextColor(lightText[0], lightText[1], lightText[2]);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      for (const meal of day.meals) {
        const mealLines = pdf.splitTextToSize(`• ${meal}`, 165);
        pdf.text(mealLines, 30, yPosition);
        yPosition += mealLines.length * 4;
      }
      yPosition += 2;
    }

    // Notes
    if (day.notes) {
      pdf.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      pdf.text("Notes:", 25, yPosition);
      yPosition += 5;

      pdf.setTextColor(lightText[0], lightText[1], lightText[2]);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const noteLines = pdf.splitTextToSize(day.notes, 165);
      pdf.text(noteLines, 30, yPosition);
      yPosition += noteLines.length * 4;
    }

    yPosition += 8;
  }

  // Hotel Recommendations Section
  if (data.hotels.length > 0) {
    if (yPosition > 240) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
    pdf.setFontSize(14);
    pdf.setFont("helvetica", "bold");
    pdf.text("HOTEL RECOMMENDATIONS", 20, yPosition);

    pdf.setDrawColor(mutedText[0], mutedText[1], mutedText[2]);
    pdf.line(20, yPosition + 2, 190, yPosition + 2);

    yPosition += 12;

    for (const hotel of data.hotels) {
      if (yPosition > 250) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "bold");
      pdf.text(hotel.name, 20, yPosition);

      pdf.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "normal");
      const priceDisplay = hotel.pricePerNight.includes('RM') ? hotel.pricePerNight : `RM ${hotel.pricePerNight}`;
      pdf.text(`${hotel.type} | ${hotel.location} | ${priceDisplay}`, 20, yPosition + 6);

      yPosition += 12;

      pdf.setTextColor(lightText[0], lightText[1], lightText[2]);
      pdf.setFontSize(9);
      for (const highlight of hotel.highlights) {
        const highlightLines = pdf.splitTextToSize(`• ${highlight}`, 170);
        pdf.text(highlightLines, 25, yPosition);
        yPosition += highlightLines.length * 4;
      }

      yPosition += 4;
    }
  }

  // Local Food & Attractions Section
  if (yPosition > 240) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("LOCAL FOOD & ATTRACTIONS", 20, yPosition);

  pdf.setDrawColor(mutedText[0], mutedText[1], mutedText[2]);
  pdf.line(20, yPosition + 2, 190, yPosition + 2);

  yPosition += 12;

  if (data.localFood.length > 0) {
    pdf.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Must-Try Foods:", 20, yPosition);
    yPosition += 6;

    pdf.setTextColor(lightText[0], lightText[1], lightText[2]);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    for (const food of data.localFood) {
      const foodLines = pdf.splitTextToSize(`• ${food}`, 170);
      pdf.text(foodLines, 25, yPosition);
      yPosition += foodLines.length * 4;
    }
    yPosition += 4;
  }

  if (data.attractions.length > 0) {
    if (yPosition > 240) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("Top Attractions:", 20, yPosition);
    yPosition += 6;

    pdf.setTextColor(lightText[0], lightText[1], lightText[2]);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    for (const attraction of data.attractions) {
      const attractionLines = pdf.splitTextToSize(`• ${attraction}`, 170);
      pdf.text(attractionLines, 25, yPosition);
      yPosition += attractionLines.length * 4;
    }
    yPosition += 4;
  }

  // Budget Breakdown Section
  if (yPosition > 220) {
    pdf.addPage();
    yPosition = 20;
  }

  pdf.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("BUDGET BREAKDOWN", 20, yPosition);

  pdf.setDrawColor(mutedText[0], mutedText[1], mutedText[2]);
  pdf.line(20, yPosition + 2, 190, yPosition + 2);

  yPosition += 12;

  // Budget table
  const budgetRows = [
    ["Category", "Amount (RM)", "Percentage"],
    [
      "Accommodation",
      `RM ${data.budgetAllocation.accommodation.toLocaleString()}`,
      `${((data.budgetAllocation.accommodation / data.budget) * 100).toFixed(1)}%`,
    ],
    [
      "Food",
      `RM ${data.budgetAllocation.food.toLocaleString()}`,
      `${((data.budgetAllocation.food / data.budget) * 100).toFixed(1)}%`,
    ],
    [
      "Transport",
      `RM ${data.budgetAllocation.transport.toLocaleString()}`,
      `${((data.budgetAllocation.transport / data.budget) * 100).toFixed(1)}%`,
    ],
    [
      "Activities",
      `RM ${data.budgetAllocation.activities.toLocaleString()}`,
      `${((data.budgetAllocation.activities / data.budget) * 100).toFixed(1)}%`,
    ],
    [
      "Contingency",
      `RM ${data.budgetAllocation.contingency.toLocaleString()}`,
      `${((data.budgetAllocation.contingency / data.budget) * 100).toFixed(1)}%`,
    ],
  ];

  (pdf as any).autoTable({
    head: [budgetRows[0]],
    body: budgetRows.slice(1),
    startY: yPosition,
    margin: 20,
    headStyles: {
      fillColor: accentColor,
      textColor: darkBg,
      fontStyle: "bold",
      fontSize: 10,
    },
    bodyStyles: {
      fillColor: [30, 30, 30],
      textColor: lightText,
      fontSize: 9,
    },
    alternateRowStyles: {
      fillColor: [25, 25, 25],
    },
    lineColor: mutedText,
  });

  // Footer
  const pageCount = (pdf as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setTextColor(mutedText[0], mutedText[1], mutedText[2]);
    pdf.setFontSize(8);
    pdf.text(
      `Page ${i} of ${pageCount}`,
      pdf.internal.pageSize.getWidth() / 2,
      pdf.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  return Buffer.from(pdf.output("arraybuffer"));
}
