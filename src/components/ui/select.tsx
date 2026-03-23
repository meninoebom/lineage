import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      data-slot="select"
      className={cn(
        "flex h-10 w-full rounded border border-transparent bg-surface-container-highest px-3 py-2 font-sans text-sm",
        "focus-visible:outline-none focus-visible:bg-white focus-visible:border-outline-variant/20 focus-visible:ring-2 focus-visible:ring-ring/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors appearance-none pr-9",
        className
      )}
      style={{
        backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23656261' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundSize: "12px",
        backgroundPosition: "right 12px center",
        backgroundRepeat: "no-repeat",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export { Select };
