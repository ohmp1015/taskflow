"use client";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import React from "react";
// This component is used in the marketing page to display the main heading and call to action
// It checks if the user is authenticated and displays different buttons accordingly

export const Heading = () => {
  const { isAuthenticated, isLoading } = useConvexAuth();
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
        Your Ideas, Documents, & plans, Unified, welcome to{" "}
        <span className="underline">Taskflow</span>
      </h1>
      <h3 className="text-base sm:text-xl md:text-2xl font-medium">
        Taskflow is the connected workspace where <br />
        better, faster work happens
      </h3>
      {isLoading && (
        <div className="w-full flex items-center justify-center">
          <Spinner size="lg" />
        </div>
      )}
      {!isAuthenticated && !isLoading && (
        <SignUpButton mode="modal">
          <Button size="sm">
            Get Taskflow free <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </SignUpButton>
      )}
      {isAuthenticated && !isLoading && (
        <Button asChild>
          <Link href="/documents">
            Enter Taskflow <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      )}
    </div>
  );
};