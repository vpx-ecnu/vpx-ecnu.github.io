
import { Link } from "react-router-dom";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-background py-6">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4 md:gap-8">
        <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
          <Link to="/" className="text-lg font-semibold">
            Research Group
          </Link>
          <p className="text-sm text-muted-foreground">
            Advancing knowledge through collaborative research.
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <Link
            to="/about"
            className="transition-colors hover:text-foreground"
          >
            About
          </Link>
          <Link
            to="/join"
            className="transition-colors hover:text-foreground"
          >
            Join Us
          </Link>
          <Link
            to="/intranet"
            className="transition-colors hover:text-foreground"
          >
            Intranet
          </Link>
        </div>
        
        <div className="text-sm text-muted-foreground">
          © {year} Research Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
