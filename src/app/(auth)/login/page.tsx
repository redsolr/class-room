import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getRoles, homeFor } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const roles = await getRoles();
  if (roles) redirect(homeFor(roles));
  return <LoginForm />;
}
