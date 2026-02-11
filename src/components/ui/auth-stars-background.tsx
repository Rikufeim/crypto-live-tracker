"use client";
import React from "react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StarsBackground } from "@/components/ui/stars-background";

export function AuthStarsBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none auth-bg"
    >
      <ShootingStars />
      <StarsBackground />
    </div>
  );
}

