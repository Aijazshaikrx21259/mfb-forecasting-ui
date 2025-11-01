"use client";

import { useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Dashboard() {
  const { user } = useUser();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Purchase Forecasting Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.firstName || user?.username || 'User'}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Placeholder cards for future features */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📊 Purchase Planning
            </h3>
            <p className="text-gray-600 mb-4">
              View and manage your food purchase forecasts
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Coming Soon
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📦 Inventory Management
            </h3>
            <p className="text-gray-600 mb-4">
              Track current stock levels and inventory status
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Coming Soon
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              📈 Reports & Analytics
            </h3>
            <p className="text-gray-600 mb-4">
              View detailed reports and purchasing analytics
            </p>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Coming Soon
            </button>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}