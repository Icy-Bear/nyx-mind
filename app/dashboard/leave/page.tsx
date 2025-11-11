import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeaveBalance, getLeaveHistory, getPendingLeaveRequests } from "@/actions/leave";
import LeaveBalance from "@/components/LeaveBalance";
import ApplyLeaveForm from "@/components/ApplyLeaveForm";
import LeaveHistory from "@/components/LeaveHistory";
import LeaveApproval from "@/components/admin/LeaveApproval";
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
      <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl font-bold">Leave Management</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Review and manage employee leave requests
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span>{formattedRequests.length} pending requests</span>
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
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl font-bold">My Leave</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage your leave requests and view your balance
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{formattedHistory.length} total requests</span>
        </div>
      </div>

      {/* Leave Balance Cards */}
      <div className="mb-6 sm:mb-8">
        <LeaveBalance balance={balance} />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="apply" className="w-full max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="apply" className="text-xs sm:text-sm">
            <Calendar className="h-4 w-4 sm:mr-2 hidden sm:inline" />
            Apply for Leave
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">
            <Clock className="h-4 w-4 sm:mr-2 hidden sm:inline" />
            Leave History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="apply" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Submit Leave Request
              </CardTitle>
              <CardDescription>
                Fill out the form below to apply for leave. Your request will be
                reviewed by your manager.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ApplyLeaveForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <LeaveHistory requests={formattedHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}