import Link from "next/link";

/** Consent line for lead / waitlist forms — links Privacy and Terms. */
export function LegalConsentNote({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-xs leading-relaxed text-muted-foreground"}>
      By submitting, you agree to our{" "}
      <Link
        href="/privacy"
        className="font-medium text-foreground underline-offset-2 hover:underline"
      >
        Privacy Policy
      </Link>{" "}
      and{" "}
      <Link
        href="/terms"
        className="font-medium text-foreground underline-offset-2 hover:underline"
      >
        Terms of Use
      </Link>
      .
    </p>
  );
}
