import { authenticator } from "~/services/auth.server";
import { ActionFunction, json, LoaderArgs } from "@remix-run/node";
import React from "react";
import { Form } from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/login",
  });
  return json({ userId });
}

export const action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: "/login" });
};

export default function Index() {
  return (
    <>
      <h1 className="text-3xl font-bold underline text-green-500">
        Hello world!
      </h1>
      <Form method="post">
        <button>Log Out</button>
      </Form>
    </>
  );
}
