import { cn } from "@/lib/utils";

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

function Input({ className, type = "text", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded border border-transparent bg-surface-container-highest px-3 py-2 font-sans text-sm",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:bg-white focus-visible:border-outline-variant/20 focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors",
        className
      )}
      {...props}
    />
  );
}

export { Input };
