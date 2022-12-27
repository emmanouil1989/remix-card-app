import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticator, createVerificationToken } from "~/services/auth.server";
import { ValidatedForm, validationError } from "remix-validated-form";
import { Input } from "~/components/Form/Input/Input";
import { Link, useActionData } from "@remix-run/react";
import { SubmitButton } from "~/components/Form/SubmitButton/SubmitButton";
import React from "react";
import { withZod } from "@remix-validated-form/with-zod";
import z from "zod";
import { getUserByEmailAddress } from "~/services/user.server";
import { getDomainUrl } from "~/services/misc.server";
import type { User } from "@prisma/client";

const validator = withZod(
  z.object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email("Must be a valid email"),
  }),
);
export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  return json({ success: true });
}

export async function action({ request }: ActionArgs) {
  const fieldValues = await validator.validate(await request.formData());
  if (fieldValues.error) return validationError(fieldValues.error);
  const { email } = fieldValues.data;
  const existingUser = await getUserByEmailAddress(email);
  if (!existingUser) {
    return validationError({
      fieldErrors: {
        email: "Email not found",
      },
    });
  }
  const { id, email: existingUserEmail } = existingUser;
  const verificationToken = await createVerificationToken(
    id,
    existingUserEmail,
  );
  const url = new URL(`${getDomainUrl(request)}/auth/reset-password`);
  url.searchParams.set("token", verificationToken.token);
  //send Email
  console.log(url.toString());

  return json({ user: existingUser }, { status: 200 });
}

const isUserType = (data: unknown): data is SerializeFrom<{ user: User }> => {
  return data != undefined && typeof data === "object" && "user" in data;
};
export default function ForgetPassword() {
  const actionData = useActionData<typeof action>();

  return (
    <section className={"flex items-center justify-center h-full flex-col"}>
      {isUserType(actionData) && (
        <span className={"text-green-400 font-bold text-2xl"}>
          A verification code has been sent to {actionData.user.email}
        </span>
      )}
      <ValidatedForm
        validator={validator}
        method={"post"}
        className={"flex flex-col items-start justify-between w-3/12"}
      >
        <div className={"flex flex-col w-full justify-between py-4"}>
          <Input name={"email"} label={"Email:"} type={"email"} />
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
            submitText={"Password Reset"}
            submittingText={"processing.."}
          />
        </div>
      </ValidatedForm>
    </section>
  );
}
