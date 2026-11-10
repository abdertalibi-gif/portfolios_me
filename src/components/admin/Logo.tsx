import { User } from "lucide-react";
import { cn } from "./ui";

export function Logo({ className }: { className?: string }) {
  return (
    <User
      className={cn(
        "h-6 w-6 text-[#2196D3]",
        className,
        "rounded-full",
      )}
    />
  );
}
