import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const passwordResetInput = z.object({
  email: z.string().email().max(254),
});

const emailVerificationInput = z.object({
  idToken: z.string().min(20).max(8192),
  expectedUid: z.string().min(1).max(128),
  newEmail: z.string().email().max(254),
});

const requestPasswordResetServer = createServerFn({ method: "POST" })
  .validator((input: unknown) => passwordResetInput.parse(input))
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { sendStaffPasswordReset } = await import("./staff-email.server");
    await sendStaffPasswordReset(data.email);
    return { ok: true };
  });

const requestEmailVerificationServer = createServerFn({ method: "POST" })
  .validator((input: unknown) => emailVerificationInput.parse(input))
  .handler(async ({ data }) => {
    const { assertSameSiteRequest } = await import("@/lib/auth/isolation.server");
    assertSameSiteRequest();
    const { sendStaffEmailVerification } = await import("./staff-email.server");
    return sendStaffEmailVerification(data);
  });

export function requestStaffPasswordReset(email: string) {
  return requestPasswordResetServer({ data: { email } });
}

export function requestStaffEmailVerification(input: {
  idToken: string;
  expectedUid: string;
  newEmail: string;
}) {
  return requestEmailVerificationServer({ data: input });
}
