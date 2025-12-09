"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  BarChart3,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { getUserTotalHours, getUserWeeklyBreakdown } from "@/actions/weekly-reports";
import { toast } from "sonner";

interface WeeklyData {
  weekStartDate: string;
  targetHours: number;
  actualHours: number;
  progressPercentage: number;
}

interface EnhancedUserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
    createdAt?: Date;
  };
  isCurrentUser?: boolean;
  className?: string;
  onOpenWeeklyReport?: () => void;
}

export function EnhancedUserCard({ user, isCurrentUser = false, className = "", onOpenWeeklyReport }: EnhancedUserCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [totalHours, setTotalHours] = useState<number | null>(null);
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      const [total, weekly] = await Promise.all([
        getUserTotalHours(user.id),
        getUserWeeklyBreakdown(user.id, 12) // Last 12 weeks
      ]);
      
      setTotalHours(total);
      setWeeklyData(weekly);
    } catch (error) {
      console.error(`Failed to load data for user ${user.id}:`, error);
      toast.error("Failed to load user hours data");
    } finally {
      setLoading(false);
    }
  }, [user.id, loading]);

  useEffect(() => {
    if (isExpanded && (totalHours === null || weeklyData.length === 0)) {
      loadData();
    }
  }, [isExpanded, totalHours, weeklyData.length, loadData]);

  const stats = useMemo(() => {
    if (weeklyData.length === 0) return null;
    
    const totalTarget = weeklyData.reduce((sum, week) => sum + week.targetHours, 0);
    const totalActual = weeklyData.reduce((sum, week) => sum + week.actualHours, 0);
    const avgWeekly = totalActual / weeklyData.length;
    const weeksMetTarget = weeklyData.filter(week => week.actualHours >= week.targetHours).length;
    const consistencyRate = (weeksMetTarget / weeklyData.length) * 100;
    
    return {
      totalTarget,
      totalActual,
      avgWeekly,
      consistencyRate,
      weeksMetTarget,
      totalWeeks: weeklyData.length
    };
  }, [weeklyData]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "bg-green-500";
    if (percentage >= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getProgressVariant = (percentage: number) => {
    if (percentage >= 100) return "default";
    if (percentage >= 80) return "secondary";
    return "destructive";
  };

  return (
    <Card className={`transition-all duration-200 hover:shadow-md ${isCurrentUser ? "ring-2 ring-primary" : ""} ${className}`}>
      <CardContent className="p-4">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image ?? undefined} alt={user.name} />
              <AvatarFallback className="text-sm font-medium">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-base truncate flex items-center gap-2">
                {user.name}
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs border-primary text-primary flex-shrink-0">
                    You
                  </Badge>
                )}
              </h3>
              <p className="text-sm text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant={user.role === "admin" ? "default" : "secondary"} className="text-xs">
              {user.role}
            </Badge>
            {onOpenWeeklyReport && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onOpenWeeklyReport}
                className="h-8 w-8 p-0"
                title="Open Weekly Report"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <Clock className="h-3 w-3" />
              Total Hours
            </div>
            <div className="text-lg font-bold">
              {loading ? (
                <div className="animate-pulse bg-muted rounded h-6 w-16"></div>
              ) : (
                totalHours?.toFixed(1) || "0.0"
              )}
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <BarChart3 className="h-3 w-3" />
              Avg/Week
            </div>
            <div className="text-lg font-bold">
              {loading ? (
                <div className="animate-pulse bg-muted rounded h-6 w-16"></div>
              ) : (
                stats?.avgWeekly.toFixed(1) || "0.0"
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-1 justify-between"
            disabled={loading}
          >
            <span className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekly Breakdown
            </span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
          
          {onOpenWeeklyReport && (
            <Button
              variant="default"
              size="sm"
              onClick={onOpenWeeklyReport}
              className="px-3"
              title="Open Detailed Weekly Report"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Expanded Section */}
        {isExpanded && (
          <div className="mt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
            {loading ? (
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="animate-pulse bg-muted rounded h-4 w-32"></div>
                    <div className="animate-pulse bg-muted rounded h-2 w-full"></div>
                  </div>
                ))}
              </div>
            ) : weeklyData.length > 0 ? (
              <>
                {/* Summary Stats */}
                {stats && (
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                      <div className="text-xs text-green-600 dark:text-green-400">Target Met</div>
                      <div className="text-sm font-bold text-green-700 dark:text-green-300">
                        {stats.weeksMetTarget}/{stats.totalWeeks}
                      </div>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                      <div className="text-xs text-blue-600 dark:text-blue-400">Consistency</div>
                      <div className="text-sm font-bold text-blue-700 dark:text-blue-300">
                        {stats.consistencyRate.toFixed(0)}%
                      </div>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                      <div className="text-xs text-purple-600 dark:text-purple-400">Total Target</div>
                      <div className="text-sm font-bold text-purple-700 dark:text-purple-300">
                        {stats.totalTarget.toFixed(0)}h
                      </div>
                    </div>
                  </div>
                )}

                {/* Weekly Progress List */}
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {weeklyData.map((week) => (
                    <div key={week.weekStartDate} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            Week of {format(new Date(week.weekStartDate), "MMM dd")}
                          </span>
                          {week.actualHours >= week.targetHours ? (
                            <TrendingUp className="h-3 w-3 text-green-600" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {week.actualHours.toFixed(1)}/{week.targetHours}h
                          </span>
                          <Badge 
                            variant={getProgressVariant(week.progressPercentage)}
                            className="text-xs"
                          >
                            {week.progressPercentage.toFixed(0)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="relative">
                        <Progress 
                          value={Math.min(week.progressPercentage, 100)} 
                          className="h-2"
                        />
                        <div 
                          className={`absolute top-0 left-0 h-full rounded-full ${getProgressColor(week.progressPercentage)} transition-all duration-300`}
                          style={{ width: `${Math.min(week.progressPercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No weekly data available</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}