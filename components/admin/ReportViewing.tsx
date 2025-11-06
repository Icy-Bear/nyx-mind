"use client";

import { useEffect, useState, startTransition } from "react";
import { getReports } from "@/actions/reports"; // <-- your server action
import type { ReportRow } from "@/db/schema";

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const data = await getReports(); // ✅ Directly calling server action
        setReports(data);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load reports");
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (loading)
    return (
      <p className="text-center mt-10 text-gray-500">Loading reports...</p>
    );
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (reports.length === 0)
    return <p className="text-center mt-10 text-gray-400">No reports found</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-semibold text-center mb-6">All Reports</h1>

      {reports.map((report) => (
        <div
          key={report.id}
          className="p-5 rounded-2xl shadow border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
        >
          <p className="text-sm text-gray-500 mb-2">
            Created: {new Date(report.createdAt).toLocaleString()}
          </p>

          <div className="mb-3">
            <h2 className="font-semibold">Today&apos;s Work</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {report.todaysWork}
            </p>
          </div>

          {report.blockers && (
            <div className="mb-3">
              <h2 className="font-semibold">Blockers</h2>
              <p className="text-gray-700 dark:text-gray-300">
                {report.blockers}
              </p>
            </div>
          )}

          <div>
            <h2 className="font-semibold">Tomorrow&apos;s Plans</h2>
            <p className="text-gray-700 dark:text-gray-300">
              {report.tomorrowsPlans}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
