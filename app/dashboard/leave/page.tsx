import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getLeaveBalance, getLeaveHistory, getPendingLeaveRequests } from "@/actions/leave";
import LeaveBalance from "@/components/LeaveBalance";
import ApplyLeaveForm from "@/components/ApplyLeaveForm";
import LeaveHistory from "@/components/LeaveHistory";
import LeaveApproval from "@/components/admin/LeaveApproval";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Leave Management</h1>
          <p className="text-muted-foreground">
            Review and manage employee leave requests
          </p>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Leave</h1>
        <p className="text-muted-foreground">
          Manage your leave requests and view your balance
        </p>
      </div>

      <LeaveBalance balance={balance} />

      <Tabs defaultValue="apply" className="space-y-4">
        <TabsList>
          <TabsTrigger value="apply">Apply for Leave</TabsTrigger>
          <TabsTrigger value="history">Leave History</TabsTrigger>
        </TabsList>

        <TabsContent value="apply">
          <Card>
            <CardHeader>
              <CardTitle>Submit Leave Request</CardTitle>
            </CardHeader>
            <CardContent>
              <ApplyLeaveForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <LeaveHistory requests={formattedHistory} />
        </TabsContent>
      </Tabs>
    </div>
  );
}