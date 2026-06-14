import { ar } from "@/lib/i18n/ar";

export function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} {ar.brand}. مبني باستخدام Next.js وFirebase وGoogle Maps.
      </div>
    </footer>
  );
}
