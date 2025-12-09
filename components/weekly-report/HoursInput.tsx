"use client";

import { Button } from "@/components/ui/button";

interface HoursInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

export function HoursInput({
  value,
  onChange,
  min = 0,
  max = 24,
  disabled = false,
}: HoursInputProps) {
  const increment = () => {
    if (!disabled && value < max) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (!disabled && value > min) {
      onChange(value - 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 sm:h-8 sm:w-8 p-0 shrink-0"
        onClick={decrement}
        disabled={disabled || value <= min}
      >
        -
      </Button>
      <div className="flex items-center justify-center w-14 sm:w-12 h-9 sm:h-8 border rounded-md bg-muted/50 min-w-[3.5rem] sm:min-w-[3rem]">
        <span className="font-mono text-sm sm:text-sm font-medium">
          {value}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        className="h-9 w-9 sm:h-8 sm:w-8 p-0 shrink-0"
        onClick={increment}
        disabled={disabled || value >= max}
      >
        +
      </Button>
    </div>
  );
}