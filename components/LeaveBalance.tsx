"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SelectLeaveBalance } from "@/db/schema/leave-schema";

import { Calendar, Heart } from "lucide-react";

interface LeaveBalanceProps {
  balance: SelectLeaveBalance;
}

export function LeaveBalance({ balance }: LeaveBalanceProps) {
  const totalBalance = balance.clBalance + balance.mlBalance;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile Stacked Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Casual Leave Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Casual Leave</CardTitle>
            <div className="p-2 bg-blue-100 rounded-full">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">
              {parseFloat(balance.clBalance.toString()).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">Available days</p>
            <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (parseFloat(balance.clBalance.toString()) / 12) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medical Leave Card */}
        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Medical Leave</CardTitle>
            <div className="p-2 bg-red-100 rounded-full">
              <Heart className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">
              {balance.mlBalance}
            </div>
            <p className="text-xs text-muted-foreground">Available days</p>
            <div className="mt-2 h-1 bg-red-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-600 rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min((balance.mlBalance / 12) * 100, 100)}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>


      </div>


    </div>
  );
}

export default LeaveBalance;
