import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 font-sans text-xs transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary-container text-on-secondary-container",
        tradition: "bg-surface-container-low text-foreground hover:bg-surface-dim cursor-pointer",
        family: "bg-primary/10 text-primary",
        outline: "border border-outline-variant/20 text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
