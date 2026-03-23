import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: "terracotta" | "green" | "none";
}

function Card({ className, accent = "none", ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      className={cn(
        "rounded border border-border/50 bg-card p-5 transition-colors hover:bg-accent/50",
        accent === "terracotta" && "border-t-2 border-t-primary",
        accent === "green" && "border-t-2 border-t-chart-2",
        className
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3", className)} {...props} />;
}

function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg font-normal tracking-tight", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 flex items-center gap-2", className)}
      {...props}
    />
  );
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
