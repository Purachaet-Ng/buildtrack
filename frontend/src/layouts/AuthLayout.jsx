/**
 * Login and register shell: a single centered 400px card on the #F9FBFB app
 * background. No split-screen hero, no marketing copy — this is an internal tool.
 * Sprint 2.
 */

import React from "react";
import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="flex-col h-screen  w-100 my-10 mx-auto text-center   ">
      <div>
        <p className="text-2xl mb-6">BuildTrack</p>
      </div>
      <div className="  border rounded-2xl  ">
        <Outlet />
      </div>
    </div>
  );
}

export default AuthLayout;
