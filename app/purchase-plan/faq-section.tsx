"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is the Purchase Plan?",
    answer: "The Purchase Plan shows you how much of each item you should order for next month based on historical data and smart forecasting. It helps you plan your purchases in advance so you have the right amount of food to distribute."
  },
  {
    question: "What does 'Suggested Qty' mean?",
    answer: "Suggested Qty (Quantity) is our best estimate of how much you'll need for next month. This number is calculated by analyzing your past distribution patterns and predicting future demand."
  },
  {
    question: "What is the '80% Interval' column?",
    answer: "The 80% Interval shows a range (low to high) where we're 80% confident the actual demand will fall. For example, if it shows '1,000 - 1,500', we're very confident you'll need between 1,000 and 1,500 units. A wider range means more uncertainty."
  },
  {
    question: "What do the forecasting methods mean (ETS, CrostonSBA, TSB)?",
    answer: "These are different mathematical approaches we use to predict demand:\n\n• ETS (Exponential Smoothing): Best for items with steady, predictable demand\n• CrostonSBA: Best for items ordered occasionally (intermittent demand)\n• TSB (Teunter-Syntetos-Babai): Best for items that are being phased out or have declining demand\n\nThe system automatically picks the best method for each item."
  },
  {
    question: "What does Priority mean (High, Medium, Low)?",
    answer: "Priority helps you focus on the most important items first:\n\n• High (Red): Large quantities needed or high uncertainty - order these first\n• Medium (Orange): Moderate importance - order after high priority items\n• Low (Green): Smaller quantities or very predictable - can order last\n\nPriority is calculated based on quantity needed and forecast confidence."
  },
  {
    question: "What do the flags mean?",
    answer: "Flags alert you to items that need special attention:\n\n• High Risk: The forecast has high uncertainty - consider ordering extra buffer stock\n• High Volume: You'll need a large quantity - plan storage space and budget accordingly"
  },
  {
    question: "How do I search for specific items?",
    answer: "Use the search box at the top to find items by:\n• Item ID (e.g., 'P-352101')\n• Item name (e.g., 'Spaghetti')\n• Category (e.g., 'Dry Goods')\n• Vendor name\n\nResults update instantly as you type."
  },
  {
    question: "How do I sort the list?",
    answer: "Click any column header to sort by that column:\n• Priority: See highest priority items first (recommended)\n• Suggested Qty: See items with largest quantities first\n• Item name: Sort alphabetically\n\nClick the same header again to reverse the sort order (ascending/descending)."
  },
  {
    question: "How do I change how many items I see per page?",
    answer: "Use the 'Show:' dropdown near the top right. You can choose:\n• 5 items per page\n• 10 items per page (default)\n• 15 items per page\n• Max - shows all items at once (useful for printing or reviewing everything)"
  },
  {
    question: "How do I export the plan?",
    answer: "Click the 'Export CSV' button at the top right. This downloads a spreadsheet file with all items that you can:\n• Open in Excel or Google Sheets\n• Share with your team\n• Print for reference\n• Use for budget planning"
  },
  {
    question: "How accurate are these forecasts?",
    answer: "Forecast accuracy varies by item:\n• Items with steady, regular demand: Very accurate (typically within 10-15%)\n• Items with occasional orders: Less accurate but still helpful for planning\n• New items or items with limited history: May be less reliable\n\nThe 80% Interval gives you a sense of confidence - narrower ranges mean more certainty."
  },
  {
    question: "What if I disagree with a suggestion?",
    answer: "These are recommendations to help you plan, not strict requirements. You should:\n• Use your experience and knowledge of upcoming events\n• Adjust for special circumstances (holidays, new programs, etc.)\n• Consider storage capacity and budget constraints\n• Review the 80% Interval to understand the range of possibilities"
  },
  {
    question: "When is this data updated?",
    answer: "The forecast is updated regularly (typically monthly) based on the latest distribution data. The 'Forecast run' badge at the top shows when the current forecast was generated."
  },
  {
    question: "Why don't I see all my items?",
    answer: "Items appear in the Purchase Plan only if:\n• They have at least 3 months of historical distribution data\n• They've been distributed recently (within the last 18 months)\n• The forecasting system was able to generate a prediction\n\nNew items or items with very limited history won't appear until more data is available."
  },
  {
    question: "What should I do with this information?",
    answer: "Use the Purchase Plan to:\n1. Review high-priority items first (red badges)\n2. Check suggested quantities against your budget and storage\n3. Place orders with vendors based on the recommendations\n4. Flag any items with 'High Risk' for extra attention\n5. Export the plan to share with your purchasing team\n6. Compare actual orders against suggestions to improve future planning"
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="mt-12 mb-8">
      <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
      <div className="space-y-3">
        {faqs.map((faq, index) => (
          <Card key={index} className="overflow-hidden">
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
              aria-expanded={openIndex === index}
            >
              <span className="font-medium text-neutral-900 pr-4">
                {faq.question}
              </span>
              {openIndex === index ? (
                <ChevronUp className="h-5 w-5 text-neutral-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-neutral-500 flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-6 pb-4 pt-2 text-neutral-700 whitespace-pre-line">
                {faq.answer}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

