"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar, Heart } from "lucide-react";
import { SelectLeaveBalance } from "@/db/schema";

interface LeaveBalanceProps {
  balance: SelectLeaveBalance;
}

export function LeaveBalance({ balance }: LeaveBalanceProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Casual Leave (CL)</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{balance.clBalance}</div>
          <p className="text-xs text-muted-foreground">
            Available days
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Medical Leave (ML)</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{balance.mlBalance}</div>
          <p className="text-xs text-muted-foreground">
            Available days
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default LeaveBalance;