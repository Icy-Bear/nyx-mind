"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, User, FileText } from "lucide-react";

interface LeaveRequest {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  status: string;
  createdAt: string;
  approvedBy?: string | null;
  approverName?: string | null;
}

interface LeaveHistoryProps {
  requests: LeaveRequest[];
}

export function LeaveHistory({ requests }: LeaveHistoryProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredRequests = requests.filter((request) =>
    statusFilter === "all" || request.status === statusFilter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "Pending":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      Approved: "default",
      Rejected: "destructive",
      Pending: "secondary",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  if (requests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Calendar className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No leave requests</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            You haven&apos;t submitted any leave requests yet. Apply for your first leave to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Requests</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {filteredRequests.length} of {requests.length} requests
              </span>
            </div>
            
            {/* Status Summary */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Pending: {requests.filter(r => r.status === "Pending").length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Approved: {requests.filter(r => r.status === "Approved").length}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Rejected: {requests.filter(r => r.status === "Rejected").length}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    request.status === "Approved" ? "bg-green-100" :
                    request.status === "Rejected" ? "bg-red-100" :
                    "bg-yellow-100"
                  }`}>
                    {getStatusIcon(request.status)}
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      {request.leaveType} Leave
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Request ID: {request.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date and Duration Info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">From</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.fromDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">To</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.toDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Duration</p>
                    <p className="text-xs text-muted-foreground">
                      {request.totalDays} {request.totalDays === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Submitted</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Justification */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">Justification</span>
                </div>
                <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
                  {request.reason}
                </p>
              </div>

              {/* Processed By */}
              {request.status !== "Pending" && request.approverName && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                  <User className="h-4 w-4" />
                  <span>Processed by: {request.approverName}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default LeaveHistory;