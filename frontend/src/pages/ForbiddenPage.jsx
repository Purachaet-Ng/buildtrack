/**
 * 403 — 'คุณไม่มีสิทธิ์เข้าถึงหน้านี้'. Centered, one line, one ghost button back to แดชบอร์ด. No large numbers, no art.
 * Sprint 2.
 */

import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ShieldAlert, LogIn } from "lucide-react";
function ForbiddenPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-12 text-center sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Visual Anchor / Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-4 text-destructive">
            <ShieldAlert className="h-12 w-12" />
          </div>
        </div>

        {/* Decorative Error Code & Text */}
        <div className="space-y-2">
          <h1 className="text-7xl font-extrabold tracking-tighter text-destructive/40 select-none">
            403
          </h1>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Access denied
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base">
            You don&apos;t have permission to access this page. Please make sure
            you are logged into the correct account.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center pt-2">
          <Button asChild variant="default" className="w-full sm:w-auto">
            <Link href="/login" className="inline-flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          </Button>

          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/" className="inline-flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go back home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ForbiddenPage;
