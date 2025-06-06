import { cn } from "@/lib/utils";

interface ShimmerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Shimmer({ className, ...props }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 rounded",
        className
      )}
      {...props}
    />
  );
} 