"use client";

import { useRole } from "@/lib/RoleContext";
import LoginScreen from "@/components/LoginScreen";
import OnboardingScreen from "@/components/OnboardingScreen";
import Navbar from "@/components/Navbar";

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, hasSelectedRole } = useRole();

  if (!isLoggedIn) {
    return <LoginScreen />;
  }

  if (!hasSelectedRole) {
    return <OnboardingScreen />;
  }

  return (
    <>
      <Navbar />
      <main className="pt-16 pb-8">{children}</main>
    </>
  );
}
