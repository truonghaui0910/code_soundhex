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
        "relative h-1.5 w-full grow rounded-full bg-muted",
        trackClassName
      )}
    >
      <SliderPrimitive.Range className={cn(
        "absolute h-full rounded-full bg-gradient-to-r from-primary to-accent",
        rangeClassName
      )} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block h-3.5 w-3.5 rounded-full border-2 border-white bg-primary shadow-lg ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110",
        thumbClassName
      )}
    />
  </SliderPrimitive.Root>
));
CustomSlider.displayName = SliderPrimitive.Root.displayName;

export { CustomSlider };