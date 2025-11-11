import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeaveBalance, getLeaveHistory, getPendingLeaveRequests } from "@/actions/leave";
import LeaveBalance from "@/components/LeaveBalance";
import LeaveHistory from "@/components/LeaveHistory";
import LeaveApproval from "@/components/admin/LeaveApproval";
import ApplyLeaveDialog from "@/components/ApplyLeaveDialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, AlertCircle } from "lucide-react";

export default async function LeavePage() {
  const session = await auth.api.getSession({
    headers: await import("next/headers").then(m => m.headers()),
  });

  if (!session) {
    redirect("/auth/login");
  }

  const userId = session.user.id;
  const isAdmin = session.user.role === "admin";

  if (isAdmin) {
    // Admin view
    const pendingRequests = await getPendingLeaveRequests();

    const formattedRequests = pendingRequests.map(req => ({
      ...req,
      fromDate: new Date(req.fromDate).toISOString().split('T')[0],
      toDate: new Date(req.toDate).toISOString().split('T')[0],
      createdAt: new Date(req.createdAt).toISOString(),
    }));

    return (
      <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Review and manage employee leave requests
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{formattedRequests.length} pending request{formattedRequests.length !== 1 ? "s" : ""}</span>
          </div>
        </div>

        <LeaveApproval requests={formattedRequests} />
      </div>
    );
  }

  // Employee view
  const [balance, history] = await Promise.all([
    getLeaveBalance(userId),
    getLeaveHistory(userId),
  ]);

  const formattedHistory = history.map(req => ({
    ...req,
    fromDate: new Date(req.fromDate).toISOString().split('T')[0],
    toDate: new Date(req.toDate).toISOString().split('T')[0],
    createdAt: new Date(req.createdAt).toISOString(),
  }));

  return (
    <div className="min-h-screen bg-background p-3 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">My Leave</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Manage your leave requests and view your balance
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
          <Calendar className="h-4 w-4 flex-shrink-0" />
          <span>{formattedHistory.length} total request{formattedHistory.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="mb-6 sm:mb-8">
        <LeaveBalance balance={balance} />
      </div>

      {/* Leave History */}
      <LeaveHistory requests={formattedHistory} />
      
      {/* Apply Leave Dialog */}
      <ApplyLeaveDialog />
    </div>
  );
}