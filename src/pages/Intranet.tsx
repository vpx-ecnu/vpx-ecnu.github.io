
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

const Intranet = () => (
  <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-12 md:px-6">
    <div className="max-w-md space-y-4 text-center">
      <Lock className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        VPX Intranet
      </h1>
      <p className="text-muted-foreground">
        The intranet is not available on this public website. VPX members can contact their supervisor for access to internal resources.
      </p>
      <Link to="/" className="inline-block text-primary underline underline-offset-4">
        Return to the homepage
      </Link>
    </div>
  </div>
);

export default Intranet;
