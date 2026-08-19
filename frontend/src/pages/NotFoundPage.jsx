/**
 * 404. Same minimal treatment as the 403 page.
 * Sprint 7.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
function NotFoundPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Decorative Error Code */}
        <div className="space-y-2">
          <h1 className="text-8xl font-extrabold tracking-tighter text-muted-foreground/30 select-none animate-pulse">
            404
          </h1>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Page not found
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It
            might have been moved or deleted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="default" className="w-full sm:w-auto">
            <Link to="/" className="inline-flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go back home
            </Link>
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => window.history.back()}
          >
            <span className="inline-flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Previous page
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
