import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRoles, homeFor } from "@/lib/auth";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Sign up" };

export default async function SignupPage() {
  const roles = await getRoles();
  if (roles) redirect(homeFor(roles));
  return <SignupForm />;
}
