import { NextRequest, NextResponse } from "next/server";
import { saveSession } from "@workos-inc/authkit-nextjs";
import { clientId, getWorkOS } from "@/lib/workos";

/**
 * OAuth callback — custom handler ported from Jurisimus web-app.
 *
 * Exchanges the authorization `code` for tokens and writes the sealed
 * session cookie. We do NOT use authkit's `handleAuth`: it requires the
 * PKCE state that only `getSignInUrl` (hosted page) sets, while our
 * Google/Apple routes use `getAuthorizationUrl` for direct provider
 * redirects with no intermediary screen.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    console.error("[auth/callback] missing authorization code");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const authResponse = await getWorkOS().userManagement.authenticateWithCode({
      code,
      clientId,
    });
    await saveSession(authResponse, request);
    // The landing page resolves the login's roles and sends it where it
    // belongs — teaching desk, classroom or study. Hardcoding /schedule
    // here assumed everyone was a teacher.
    return NextResponse.redirect(new URL("/", request.url));
  } catch (error) {
    console.error("[auth/callback] authentication failed:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
