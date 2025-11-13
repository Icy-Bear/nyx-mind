"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Calendar, Heart } from "lucide-react";
import { SelectLeaveBalance } from "@/db/schema";

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
            <div className="text-2xl sm:text-3xl font-bold">{parseFloat(balance.clBalance.toString()).toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Available days
            </p>
            <div className="mt-2 h-1 bg-blue-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((parseFloat(balance.clBalance.toString()) / 12) * 100, 100)}%` }}
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
            <div className="text-2xl sm:text-3xl font-bold">{balance.mlBalance}</div>
            <p className="text-xs text-muted-foreground">
              Available days
            </p>
            <div className="mt-2 h-1 bg-red-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-red-600 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((balance.mlBalance / 12) * 100, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Total Balance Card */}
        <Card className="relative overflow-hidden sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <div className="p-2 bg-primary/20 rounded-full">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-primary">{totalBalance}</div>
            <p className="text-xs text-muted-foreground">
              Total available days
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span>CL: {balance.clBalance}</span>
              <div className="w-2 h-2 bg-red-600 rounded-full ml-2"></div>
              <span>ML: {balance.mlBalance}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Summary Card - Only visible on small screens */}
      <Card className="sm:hidden bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Total Leave Balance</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {balance.clBalance} CL + {balance.mlBalance} ML
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{totalBalance}</div>
              <div className="text-xs text-muted-foreground">days</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LeaveBalance;