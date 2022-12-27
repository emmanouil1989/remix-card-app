import type { LoaderArgs, MetaFunction, SerializeFrom } from "@remix-run/node";
import {
  authenticator,
  getVerificationToken,
  verifyEmail,
} from "~/services/auth.server";
import { json, redirect } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { compareAsc } from "date-fns";
import { getDomainUrl } from "~/services/misc.server";

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: `/`,
  });
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  const redirectUrl = new URL(`${getDomainUrl(request)}/auth/login`);
  if (!token) {
    redirectUrl.searchParams.set("error", "No Registration Token Found");
    return redirect(redirectUrl.toString());
  }
  const verificationToken = await getVerificationToken(token);
  if (!verificationToken) {
    redirectUrl.searchParams.set("error", "Invalid token");
    return redirect(redirectUrl.toString());
  }

  if (compareAsc(new Date(), verificationToken.expires) === 1) {
    redirectUrl.searchParams.set("error", "Token has expired");
    return redirect(redirectUrl.toString());
  }
  await verifyEmail(verificationToken);
  return json({ success: true }, { status: 200 });
}

const isErrorType = (data: any): data is SerializeFrom<{ error: string }> => {
  return data && data.error !== undefined;
};
export const meta: MetaFunction = () => ({ title: "Verify Email" });
export default function Verification() {
  const loaderData = useLoaderData<typeof loader>();
  if (isErrorType(loaderData)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-600">{loaderData.error}</h1>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold text-green-600">
        Your email has been verified!
      </h1>
      <p className="text-gray-700 text-sm text-center mt-4">
        Thanks for confirming, your account is ready.
      </p>
      <div className="py-6">
        <div className="border-t border-dashed border-gray-300" />
      </div>
      <Link to="/auth/login"> Click here to login</Link>
    </div>
  );
}
