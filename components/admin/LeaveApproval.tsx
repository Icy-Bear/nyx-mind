"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Calendar,
  AlertCircle,
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
      await approveLeave(requestId);
      toast.success("Leave request approved");
      onUpdate?.();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to approve request");
      }
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      setProcessing(requestId);
      await rejectLeave(requestId);
      toast.success("Leave request rejected");
      onUpdate?.();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("Failed to reject request");
      }
    } finally {
      setProcessing(null);
    }
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
          <p className="text-muted-foreground">
            No pending leave requests to review.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <h2 className="text-lg font-semibold">
          Pending Leave Requests ({requests.length})
        </h2>
      </div>

      <div className="space-y-4">
        {requests.map((request) => (
          <Card key={request.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {request.userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{request.userName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {request.userEmail}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">
                  {request.leaveType} Leave
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(request.fromDate).toLocaleDateString()} -{" "}
                    {new Date(request.toDate).toLocaleDateString()}
                  </span>
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

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={() => handleApprove(request.id)}
                  disabled={processing === request.id}
                  className="flex-1"
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(request.id)}
                  disabled={processing === request.id}
                  className="flex-1"
                  variant="destructive"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
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