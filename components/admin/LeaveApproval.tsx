"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
  Clock,
  FileText,
  Mail,
} from "lucide-react";
import { approveLeave, rejectLeave } from "@/actions/leave";
import { toast } from "sonner";

interface PendingRequest {
  id: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason: string;
  createdAt: string;
  userName: string;
  userEmail: string;
}

interface LeaveApprovalProps {
  requests: PendingRequest[];
  onUpdate?: () => void;
}

export function LeaveApproval({ requests, onUpdate }: LeaveApprovalProps) {
  const [processing, setProcessing] = useState<string | null>(null);

  const handleApprove = async (requestId: string) => {
    try {
      setProcessing(requestId);
      const result = await approveLeave(requestId);

      if (!result.success) {
        toast.error(result.error || "Failed to approve request");
        return;
      }

      toast.success("Leave request approved");
      onUpdate?.();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId);
      const result = await rejectLeave(requestId);

      if (!result.success) {
        toast.error(result.error || "Failed to reject request");
        return;
      }

      toast.success("Leave request rejected");
      onUpdate?.();
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setProcessing(null);
    }
  };

  if (requests.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-8 sm:p-12 text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            No pending leave requests to review. All requests have been processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-full">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Pending Leave Requests</h2>
                <p className="text-sm text-muted-foreground">
                  {requests.length} request{requests.length !== 1 ? "s" : ""} awaiting your review
                </p>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-2xl font-bold text-yellow-600">{requests.length}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar className="h-12 w-12 flex-shrink-0">
                      <AvatarFallback className="text-lg font-semibold">
                        {request.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-lg truncate">{request.userName}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{request.userEmail}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 flex-shrink-0">
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800 border-yellow-200"
                    >
                      {request.leaveType} Leave
                    </Badge>
                    <Badge variant="outline">
                      {request.totalDays} {request.totalDays === 1 ? "day" : "days"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Request Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">From</p>
                    <p className="text-sm truncate">
                      {new Date(request.fromDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">To</p>
                    <p className="text-sm truncate">
                      {new Date(request.toDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Duration</p>
                    <p className="text-sm">
                      {request.totalDays} {request.totalDays === 1 ? "day" : "days"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">Submitted</p>
                    <p className="text-sm truncate">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Justification */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="font-medium text-sm">Justification for Leave</span>
                </div>
                <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md break-words">
                  <p className="whitespace-pre-wrap">{request.reason}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button
                  onClick={() => handleApprove(request.id)}
                  disabled={processing === request.id}
                  className="w-full sm:flex-1"
                  variant="default"
                >
                  {processing === request.id ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      <span className="sm:hidden">Approve</span>
                      <span className="hidden sm:inline">Approve Request</span>
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleReject(request.id)}
                  disabled={processing === request.id}
                  className="w-full sm:flex-1"
                  variant="destructive"
                >
                  {processing === request.id ? (
                    <>
                      <Spinner className="mr-2 h-4 w-4" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      <span className="sm:hidden">Reject</span>
                      <span className="hidden sm:inline">Reject Request</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default LeaveApproval;