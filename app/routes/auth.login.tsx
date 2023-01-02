import { Link, useSearchParams } from "@remix-run/react";
import { useLoaderData } from "@remix-run/react";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { authenticator, login } from "~/services/auth.server";
import { sessionStorage } from "~/services/session.server";
import { withZod } from "@remix-validated-form/with-zod";
import z from "zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { Input } from "~/components/Form/Input/Input";
import { SubmitButton } from "~/components/Form/SubmitButton/SubmitButton";
import { useSendNotification } from "~/utils/notification";

export const validator = withZod(
  z.object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email("Must be a valid email"),
    password: z.string().min(8, { message: "Bust be at least 8 characters" }),
  }),
);
export async function action({ request }: ActionArgs) {
  const fieldValues = await validator.validate(await request.formData());
  if (fieldValues.error) return validationError(fieldValues.error);
  const redirectTo = fieldValues.submittedData.redirectTo || "/";
  const { email, password } = fieldValues.data;
  const user = await login(email, password);
  if (user && !user.emailVerifiedAt)
    return validationError({
      fieldErrors: { email: "Email not verified" },
    });

  if (!user)
    return validationError({
      fieldErrors: { password: "Invalid credentials!" },
    });

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  session.set(authenticator.sessionKey, user.id);

  const headers = new Headers({
    "Set-Cookie": await sessionStorage.commitSession(session),
  });

  return redirect(redirectTo, { headers });
}

export async function loader({ request }: LoaderArgs) {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
  const url = new URL(request.url);
  const error = url.searchParams.get("error");
  const notificationMessage = url.searchParams.get("notificationMessage");
  return json({
    defaultValues: { email: "", password: "" },
    error,
    notificationMessage,
  });
}

export default function Login() {
  const [params] = useSearchParams();
  const { defaultValues, error, notificationMessage } =
    useLoaderData<typeof loader>();
  useSendNotification("Error", error);
  useSendNotification("Success", notificationMessage);
  return (
    <section className={"flex h-full justify-center items-center flex-col"}>
      <h1>Login</h1>

      <ValidatedForm
        method={"post"}
        validator={validator}
        defaultValues={defaultValues}
        className={" min-h-max p-8 w-[400px] "}
      >
        <input
          type="hidden"
          name="redirectTo"
          value={params.get("redirectTo") ?? undefined}
        />
        <div className={"flex flex-col justify-between py-4"}>
          <Input type={"text"} name={"email"} label={"Email:"} />
        </div>
        <div className={"flex flex-col justify-between py-4"}>
          <Input type={"password"} name={"password"} label={"Password:"} />
        </div>
        <div className={"py-4"}>
          <Link to={"/auth/forget-password"}>Forgot your password?</Link>
        </div>
        <div className={"flex flex-row justify-between items-center w-full"}>
          <Link
            className={
              " bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            }
            to={"/auth/register"}
          >
            Sign Up
          </Link>
          <SubmitButton submitText={"Login"} submittingText={"Logging in"} />
        </div>
      </ValidatedForm>
    </section>
  );
}
