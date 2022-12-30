import { ValidatedForm, validationError } from "remix-validated-form";
import { Input } from "~/components/Form/Input/Input";
import { Link, useLoaderData } from "@remix-run/react";
import { SubmitButton } from "~/components/Form/SubmitButton/SubmitButton";
import React from "react";
import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import {
  authenticator,
  deleteVerificationToken,
  getVerificationToken,
} from "~/services/auth.server";
import { compareAsc } from "date-fns";
import { getUserById, updateUserPassword } from "~/services/user.server";
import { getDomainUrl } from "~/services/misc.server";

const validator = withZod(
  z
    .object({
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
      confirmPassword: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords do not match",
    }),
);

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
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
    redirectUrl.searchParams.set("error", "Invalid Registration Token");
    return redirect(redirectUrl.toString());
  }

  if (compareAsc(new Date(), verificationToken.expires) === 1) {
    redirectUrl.searchParams.set("error", "Registration Token Expired");
    return redirect(redirectUrl.toString());
  }

  const user = await getUserById(verificationToken.userId);
  if (!user) {
    redirectUrl.searchParams.set("error", "No user found for token");
    return redirect(redirectUrl.toString());
  }

  await deleteVerificationToken(token);
  return json({ email: user.email }, { status: 200 });
}

export async function action({ request }: ActionArgs) {
  const fieldValues = await validator.validate(await request.formData());
  if (fieldValues.error) return validationError(fieldValues.error);
  const email = fieldValues.submittedData.email;
  if (!email) throw new Error("No email found");
  const { password } = fieldValues.data;

  await updateUserPassword(email, password);
  const redirectURL = new URL(`${getDomainUrl(request)}/auth/login`);
  redirectURL.searchParams.set(
    "notificationMessage",
    "You have successfully reset your password",
  );
  return redirect(redirectURL.toString());
}

const isEmailType = (
  data: unknown,
): data is SerializeFrom<{ email: string }> => {
  return data != undefined && typeof data === "object" && "email" in data;
};
export default function ResetPassword() {
  const loaderData = useLoaderData<typeof loader>();

  const hiddenEmailValue = isEmailType(loaderData)
    ? loaderData.email
    : undefined;
  return (
    <section className={"flex items-center justify-center h-full flex-col"}>
      <h1>Password Reset Page</h1>
      <ValidatedForm
        validator={validator}
        method={"post"}
        className={"flex flex-col items-start justify-between w-4/12"}
      >
        <input type="hidden" name="email" value={hiddenEmailValue} />
        <div className={"flex flex-col w-full justify-between py-4"}>
          <Input name={"password"} label={"New Password:"} type={"password"} />
        </div>

        <div className={"flex flex-col w-full justify-between py-4"}>
          <Input
            name={"confirmPassword"}
            label={"Confirm Password:"}
            type={"password"}
          />
        </div>

        <div className={"flex justify-between w-full items-center"}>
          <Link
            className={
              " bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            }
            to={"/"}
          >
            Back to Home
          </Link>
          <SubmitButton
            submitText={"Change Password"}
            submittingText={"processing.."}
          />
        </div>
      </ValidatedForm>
    </section>
  );
}
