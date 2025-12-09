"use client";

import { Progress } from "@/components/ui/progress";
import { Clock, TrendingUp, TrendingDown } from "lucide-react";

interface WeeklyProgressProps {
  targetHours: number;
  actualHours: number;
  progressPercentage: number;
  weekStartDate: string;
}

export function WeeklyProgress({
  targetHours,
  actualHours,
  progressPercentage,
  weekStartDate,
}: WeeklyProgressProps) {
  // Ensure values are numbers
  const safeTargetHours = Number(targetHours) || 0;
  const safeActualHours = Number(actualHours) || 0;
  const safeProgressPercentage = Number(progressPercentage) || 0;
  
  const remainingHours = Math.max(safeTargetHours - safeActualHours, 0);
  const isOverTarget = safeActualHours > safeTargetHours;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span className="font-medium">
            {safeActualHours.toFixed(1)}h / {safeTargetHours}h
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isOverTarget ? (
            <TrendingUp className="h-3 w-3 text-green-600" />
          ) : (
            <TrendingDown className="h-3 w-3 text-orange-600" />
          )}
          <span className={`font-medium ${isOverTarget ? 'text-green-600' : 'text-orange-600'}`}>
            {safeProgressPercentage.toFixed(0)}%
          </span>
        </div>
      </div>
      
      <Progress 
        value={Math.min(safeProgressPercentage, 100)} 
        className="h-2"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Week of {new Date(weekStartDate).toLocaleDateString()}</span>
        <span>
          {isOverTarget 
            ? `${(safeActualHours - safeTargetHours).toFixed(1)}h over target`
            : `${remainingHours.toFixed(1)}h remaining`
          }
        </span>
      </div>
    </div>
  );
}