"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection {
  title: string;
  description: string;
  faqs: FAQItem[];
}

const faqSections: FAQSection[] = [
  {
    title: "General System Questions",
    description: "Learn about the forecasting system and how it works",
    faqs: [
      {
        question: "What is the Maryland Food Bank Purchase Forecasting system?",
        answer: "This is a purchase forecasting application built for regional food banks to analyze historical and harmonized ERP data from Azure SQL Server database. The system projects future food purchases at an item level - for example, answering questions like 'How much tuna fish should I buy next month?' It uses advanced forecasting methods to analyze past distribution patterns and predict future demand, helping you avoid shortages and reduce waste."
      },
      {
        question: "What data does the system analyze?",
        answer: "The system analyzes:\n• Historical distribution data from your ERP system\n• Harmonized data stored in Azure SQL Server database (production)\n• Item-level purchase and distribution patterns\n• Monthly demand trends across all food items\n\nAll data is processed to provide accurate, item-specific forecasts (e.g., canned goods, produce, dairy products).\n\nNote: This MVP version uses PostgreSQL database with a few months of sample data since we don't have direct access to Maryland Food Bank's Azure SQL Server resources yet."
      },
      {
        question: "Who should use this system?",
        answer: "This system is designed for:\n• Purchasing managers who order food items\n• Warehouse managers who plan storage and inventory\n• Operations staff who coordinate distributions\n• Budget planners who need demand forecasts\n• Regional food bank administrators\n\nAnyone involved in procurement planning can benefit from these item-level insights."
      },
      {
        question: "How does it help with purchasing decisions?",
        answer: "The system provides item-level forecasts to answer specific questions like:\n• 'How much tuna fish should I buy next month?'\n• 'What quantity of rice do I need for the next quarter?'\n• 'Which items need priority ordering?'\n\nBy analyzing historical ERP data, it predicts future demand for each individual item, helping you make informed purchasing decisions and optimize your budget."
      },
      {
        question: "How often is the data updated?",
        answer: "The forecast is updated regularly (typically monthly) based on the latest distribution data from your Azure SQL Server database. The 'Forecast run' badge shows when the current forecast was generated. You'll always see the most recent predictions based on your harmonized ERP data.\n\nNote: This MVP version uses PostgreSQL with a few months of sample data for demonstration purposes, as we don't currently have direct access to Maryland Food Bank's production Azure SQL Server."
      },
      {
        question: "Do I need to sign in to use the system?",
        answer: "Some features require sign-in:\n• Public access: Home page, FAQ\n• Sign-in required: Items page, Purchase Plan\n\nThis ensures data security while keeping helpful information publicly available."
      }
    ]
  },
  {
    title: "Items Page",
    description: "Understanding individual item forecasts and history",
    faqs: [
      {
        question: "What information can I see on the Items page?",
        answer: "The Items page shows a searchable list of all food items with:\n• Item ID and name\n• Latest forecast period\n• Suggested quantity for next month\n• Forecast accuracy metrics\n• Historical distribution patterns\n\nClick any item to see detailed forecasts and charts."
      },
      {
        question: "What does the forecast chart show?",
        answer: "The forecast chart displays:\n• Historical demand (past distributions)\n• Future predictions (colored bands showing confidence ranges)\n• Flagged data points (unusual patterns or data quality issues)\n• Multiple forecast horizons (1-4 months ahead)\n\nThe shaded bands show uncertainty - wider bands mean less certainty."
      },
      {
        question: "What do the forecasting methods mean (ETS, CrostonSBA, TSB)?",
        answer: "These are different mathematical approaches we use to predict demand:\n\n• ETS (Exponential Smoothing): Best for items with steady, predictable demand patterns\n• CrostonSBA: Best for items ordered occasionally or intermittently\n• TSB (Teunter-Syntetos-Babai): Best for items being phased out or with declining demand\n\nThe system automatically picks the best method for each item based on its demand pattern."
      },
      {
        question: "Why don't I see all my items?",
        answer: "Items appear only if:\n• They have at least 3 months of historical distribution data\n• They've been distributed recently (within the last 18 months)\n• The forecasting system was able to generate a reliable prediction\n\nNew items or items with very limited history won't appear until more data is available.\n\nNote: This MVP version contains only a few months of sample data from Maryland Food Bank, so you'll see a limited number of items. The production system with full Azure SQL Server access will include complete historical data for all items."
      }
    ]
  },
  {
    title: "Purchase Plan Page",
    description: "Using the monthly purchase plan effectively",
    faqs: [
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
        answer: "The 80% Interval shows a prediction range (p10 to p90) where we're 80% confident the actual demand will fall. For example, if it shows '1,000 - 1,500', we're 80% confident you'll need between 1,000 and 1,500 units. A wider range means more uncertainty.\n\nTechnical note: This uses conformal prediction intervals, which provide reliable coverage even for intermittent or sparse demand patterns."
      },
      {
        question: "What does Priority mean (High, Medium, Low)?",
        answer: "Priority helps you focus on the most important items first:\n\n• High (Red, ≥0.7): Large quantities needed or high uncertainty - order these first\n• Medium (Orange, 0.4-0.7): Moderate importance - order after high priority items\n• Low (Green, <0.4): Smaller quantities or very predictable - can order last\n\nPriority is calculated as: 60% quantity score (normalized by 1,000 units) + 40% uncertainty score (based on the width of the 80% interval). Higher quantities and wider prediction intervals result in higher priority."
      },
      {
        question: "What do the flags mean?",
        answer: "Flags alert you to items that need special attention:\n\n• High Risk: The forecast has high uncertainty (interval width > 50% of suggested quantity) - consider ordering extra buffer stock\n• High Volume: You'll need a large quantity (>5,000 units) - plan storage space and budget accordingly"
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
      }
    ]
  },
  {
    title: "Understanding Forecasts",
    description: "How to interpret and trust the predictions",
    faqs: [
      {
        question: "How accurate are these forecasts?",
        answer: "Forecast accuracy varies by item:\n• Items with steady, regular demand: Very accurate (typically within 10-15%)\n• Items with occasional orders: Less accurate but still helpful for planning\n• New items or items with limited history: May be less reliable\n\nThe 80% Interval gives you a sense of confidence - narrower ranges mean more certainty."
      },
      {
        question: "What if I disagree with a suggestion?",
        answer: "These are recommendations to help you plan, not strict requirements. You should:\n• Use your experience and knowledge of upcoming events\n• Adjust for special circumstances (holidays, new programs, etc.)\n• Consider storage capacity and budget constraints\n• Review the 80% Interval to understand the range of possibilities"
      },
      {
        question: "How should I use prediction intervals?",
        answer: "The 80% Interval (p10-p90) helps you plan for uncertainty:\n• Narrow range (e.g., 950-1,050): High confidence - order close to suggested qty (p50)\n• Wide range (e.g., 500-2,000): High uncertainty - consider ordering extra buffer stock or splitting orders\n• Use the lower bound (p10) for minimum orders\n• Use the upper bound (p90) to plan maximum storage needs\n\nNote: The intervals use conformal prediction, which means they're calibrated to provide reliable coverage even for items with intermittent or sparse demand."
      },
      {
        question: "What should I do with this information?",
        answer: "Use the forecasts to:\n1. Review high-priority items first (red badges)\n2. Check suggested quantities against your budget and storage\n3. Place orders with vendors based on the recommendations\n4. Flag any items with 'High Risk' for extra attention\n5. Export the plan to share with your purchasing team\n6. Compare actual orders against suggestions to improve future planning"
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-4xl">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-lg text-neutral-600">
          Everything you need to know about the Maryland Food Bank Purchase Forecasting system
        </p>
      </div>

      <div className="space-y-12">
        {faqSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                {section.title}
              </h2>
              <p className="text-neutral-600">
                {section.description}
              </p>
            </div>

            {/* Section FAQs */}
            <div className="space-y-3">
              {section.faqs.map((faq, faqIndex) => {
                const faqId = `${sectionIndex}-${faqIndex}`;
                return (
                  <Card key={faqId} className="overflow-hidden">
                    <button
                      onClick={() => toggleFAQ(faqId)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
                      aria-expanded={openIndex === faqId}
                    >
                      <span className="font-medium text-neutral-900 pr-4">
                        {faq.question}
                      </span>
                      {openIndex === faqId ? (
                        <ChevronUp className="h-5 w-5 text-neutral-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-neutral-500 flex-shrink-0" />
                      )}
                    </button>
                    {openIndex === faqId && (
                      <div className="px-6 pb-4 pt-2 text-neutral-700 whitespace-pre-line">
                        {faq.answer}
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

