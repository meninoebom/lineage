import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";

interface PageLayoutProps {
  children: React.ReactNode;
  heroContent?: React.ReactNode;
}

export function PageLayout({ children, heroContent }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      {heroContent}
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-10">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
