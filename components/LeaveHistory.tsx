"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react";

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
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No leave requests</h3>
          <p className="text-muted-foreground">
                You haven&apos;t submitted any leave requests yet.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter */}
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

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <Card key={request.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  {request.leaveType} Leave
                  {getStatusIcon(request.status)}
                </CardTitle>
                {getStatusBadge(request.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">From:</span>{" "}
                  {new Date(request.fromDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">To:</span>{" "}
                  {new Date(request.toDate).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-medium">Days:</span> {request.totalDays}
                </div>
                <div>
                  <span className="font-medium">Submitted:</span>{" "}
                  {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div>
                <span className="font-medium">Reason:</span>
                <p className="mt-1 text-sm text-muted-foreground">
                  {request.reason}
                </p>
              </div>

              {request.status !== "Pending" && request.approverName && (
                <div className="text-sm text-muted-foreground">
                  Processed by: {request.approverName}
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