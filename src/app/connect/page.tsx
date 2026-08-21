import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildConnectRedirectPath } from "@/lib/content/connect-url";

export const metadata: Metadata = {
  title: "Connect — doihave.space",
  description:
    "Redirects to the checker with builder intro and specialist lead forms after you search an address.",
};

type ConnectRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Legacy `/connect` bookmarks and affiliate links → unified landing on `/`. */
export default async function ConnectRoutePage({
  searchParams,
}: ConnectRouteProps) {
  const params = await searchParams;
  redirect(buildConnectRedirectPath(params));
}
