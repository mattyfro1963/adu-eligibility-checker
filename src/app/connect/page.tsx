import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { buildConnectRedirectPath } from "@/lib/content/connect-url";

export const metadata: Metadata = {
  title: "Connect with ADU Builders — doihave.space",
  description:
    "Share your ADU or tiny-home project details and match with nearby contractors. Licensed California builders can join the beta lead network.",
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
