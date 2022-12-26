import React from "react";
import { withZod } from "@remix-validated-form/with-zod";
import z from "zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { Input } from "~/components/Form/Input/Input";
import { SubmitButton } from "~/components/Form/SubmitButton/SubmitButton";
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticator, createVerificationToken } from "~/services/auth.server";
import { getUserByEmailAddress, registerUser } from "~/services/user.server";
import { getDomainUrl } from "~/services/misc.server";
import { Link, useActionData } from "@remix-run/react";
import type { User } from "@prisma/client";
const validator = withZod(
  z
    .object({
      email: z
        .string()
        .min(1, { message: "Email is required" })
        .email("Must be a valid email"),
      password: z.string().min(8, { message: "Bust be at least 8 characters" }),
      confirmPassword: z
        .string()
        .min(8, { message: "Bust be at least 8 characters" }),
      firstName: z.string().min(1, { message: "First name is required" }),
      lastName: z.string().min(1, { message: "Last name is required" }),
      mobile: z.string().min(1, { message: "Mobile is required" }),
    })
    .refine(data => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .refine(
      data => {
        const phoneRegExp =
          /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
        return phoneRegExp.test(data.mobile);
      },
      {
        message: "Enter a valid phone number",
        path: ["mobile"],
      },
    ),
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

  const { email, password, firstName, lastName, mobile } = fieldValues.data;
  const existingUser = await getUserByEmailAddress(email);
  if (existingUser) {
    return validationError({
      fieldErrors: { email: "User with this email already exist" },
    });
  }

  const user = await registerUser({
    email,
    password,
    firstName,
    lastName,
    mobilePhone: mobile,
  });

  const verificationToken = await createVerificationToken(user.id, user.email);
  const verifyUrl = `${getDomainUrl(request)}/auth/verification?token=${
    verificationToken.token
  }`;
  console.log(verifyUrl, "verifyUrl");

  return json({ user });
}

const isUserType = (data: any): data is SerializeFrom<{ user: User }> => {
  return data && data.user !== undefined && data.user.email !== undefined;
};
export default function Register() {
  const actionData = useActionData<typeof action>();

  return (
    <section className={"flex items-center justify-center h-full flex-col"}>
      <h1>Register</h1>
      <ValidatedForm
        validator={validator}
        method={"post"}
        className={"flex flex-col items-start justify-between w-3/12"}
      >
        {isUserType(actionData) && (
          <span className={"text-green-400"}>
            Verification link has been sent to {actionData.user.email}
          </span>
        )}
        <div className={"flex flex-col w-full justify-between py-4"}>
          <Input name={"firstName"} label={"First Name"} type={"text"} />
        </div>
        <div className={"flex flex-col w-full justify-between py-4"}>
          <Input name={"lastName"} label={"Last Name:"} type={"text"} />
        </div>
        <div className={"flex flex-col w-full justify-between py-4"}>
          <Input name={"email"} label={"Email:"} type={"email"} />
        </div>
        <div className={"flex flex-col w-full justify-between py-4"}>
          <Input name={"password"} label={"Password:"} type={"password"} />
        </div>
        <div className={"flex flex-col w-full justify-between py-4"}>
          <Input
            name={"confirmPassword"}
            label={"Confirm Password:"}
            type={"password"}
          />
        </div>
        <div className={"flex flex-col w-full justify-between py-4"}>
          <Input name={"mobile"} label={"Mobile:"} type={"text"} />
        </div>
        <div className={"flex justify-between w-full items-center"}>
          <Link
            className={
              " bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            }
            to={"/auth/login"}
          >
            Login
          </Link>
          <SubmitButton
            submitText={"Sign Up"}
            submittingText={"processing.."}
          />
        </div>
      </ValidatedForm>
    </section>
  );
}
