import { Link, useSearchParams } from "@remix-run/react";
import Button from "~/components/button/Button";
import { ActionArgs, json, LoaderArgs, redirect } from "@remix-run/node";
import { authenticator, login } from "~/services/auth.server";
import {
  commitSession,
  sessionStorage,
  setCookieExpires,
} from "~/services/session.server";
import { withZod } from "@remix-validated-form/with-zod";
import z from "zod";
import { ValidatedForm, validationError } from "remix-validated-form";

export const validator = withZod(
  z.object({
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email("Must be a valid email"),
    password: z.string().min(1, { message: "Password is required" }),
  }),
);

export async function action({ request }: ActionArgs) {
  const fieldValues = await validator.validate(await request.formData());
  if (fieldValues.error) return validationError(fieldValues.error);
  const redirectTo = fieldValues.submittedData.redirectTo || "/";
  const { email, password } = fieldValues.data;
  const user = await login(email, password);

  if (!user) return json({ errors: "Invalid credentials!" });
  // if (user && !use) return json({ errors: 'Your email not verified!' })

  const session = await sessionStorage.getSession(
    request.headers.get("Cookie"),
  );
  session.set(authenticator.sessionKey, user.id);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function loader({ request }: LoaderArgs) {
  return await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  });
}

export default function Login() {
  const [params] = useSearchParams();

  return (
    <section
      className={"w-full h-full flex justify-center items-center flex-col"}
    >
      <h1>Login</h1>
      <ValidatedForm
        method={"post"}
        validator={validator}
        className={" min-h-max p-8 w-3/12 "}
      >
        <input
          type="hidden"
          name="redirectTo"
          value={params.get("redirectTo") ?? undefined}
        />
        <div className={"flex flex-col justify-between py-4"}>
          <label htmlFor="email-input">Email:</label>
          <input type={"email"} name={"email"} id={"email-input"} />
        </div>
        <div className={"flex flex-col justify-between py-4"}>
          <label htmlFor="password-input">Password:</label>
          <input type={"password"} name={"password"} id={"password-input"} />
        </div>
        <div className={"flex row justify-between items-center w-full"}>
          <Link
            className={
              " bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            }
            to={"/register"}
          >
            Sign Up
          </Link>
          <Button type={"submit"}>Login</Button>
        </div>
      </ValidatedForm>
    </section>
  );
}
