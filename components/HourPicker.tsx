"use client";

import { useEffect, useRef } from "react";

interface HourPickerProps {
  value: number;
  onChange: (v: number) => void;
}

export function HourPicker({ value, onChange }: HourPickerProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const ITEM_HEIGHT = 44;
  const TOTAL_HOURS = 25;

  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => i);

  useEffect(() => {
    const pos = value * ITEM_HEIGHT;
    listRef.current?.scrollTo({ top: pos });
  }, [value]);

  let timeoutRef: any;

  const handleScroll = () => {
    if (!listRef.current) return;
    if (timeoutRef) clearTimeout(timeoutRef);

    timeoutRef = setTimeout(() => {
      const index = Math.round(listRef.current!.scrollTop / ITEM_HEIGHT);
      const final = Math.max(0, Math.min(index, TOTAL_HOURS - 1));

      listRef.current!.scrollTo({
        top: final * ITEM_HEIGHT,
        behavior: "smooth",
      });

      onChange(final);
    }, 80);
  };

  return (
    <div className="relative w-full max-w-[120px] h-[132px] mx-auto">
      {/* Highlight */}
      <div
        className="absolute inset-x-0 border-y border-primary/40 pointer-events-none"
        style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT }}
      />

      {/* List */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="overflow-y-scroll no-scrollbar text-center text-lg font-medium"
      >
        <div className="pt-[44px] pb-[44px]">
          {hours.map((h) => (
            <div key={h} className="h-[44px] flex items-center justify-center">
              {h}h
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
