"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

interface CustomSliderProps extends React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> {
  trackClassName?: string;
  rangeClassName?: string;
  thumbClassName?: string;
}

const CustomSlider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  CustomSliderProps
>(({ className, trackClassName, rangeClassName, thumbClassName, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track
      className={cn(
        "relative h-1.5 w-full grow rounded-full bg-gray-700",
        trackClassName
      )}
    >
      <SliderPrimitive.Range className={cn(
        "absolute h-full rounded-full bg-rose-500",
        rangeClassName
      )} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block h-3.5 w-3.5 rounded-full border-2 border-white bg-rose-600 shadow-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        thumbClassName
      )}
    />
  </SliderPrimitive.Root>
));
CustomSlider.displayName = SliderPrimitive.Root.displayName;

export { CustomSlider };