/**
 * Login and register shell: a single centered 400px card on the #F9FBFB app
 * background. No split-screen hero, no marketing copy — this is an internal tool.
 * Sprint 2.
 */

import React from "react";
import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
