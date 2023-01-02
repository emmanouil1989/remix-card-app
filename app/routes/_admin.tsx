import type { LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";
import { getUserById } from "~/services/user.server";
import invariant from "tiny-invariant";
import { Link, Outlet } from "@remix-run/react";

export async function loader({ request }: LoaderArgs) {
  const userId = await authenticator.isAuthenticated(request, {
    failureRedirect: "/auth/login",
  });
  invariant(userId, "User must be logged in");
  const user = await getUserById(userId);
  invariant(user, "User must exist");
  if (user.role !== "ADMIN") {
    return redirect("/auth/login");
  }
  return json({});
}
export default function AdminServices() {
  return (
    <section
      className={
        "flex flex-col w-full h-full xl:justify-center xl:items-center"
      }
    >
      <div
        className={
          "flex w-full xl:w-[1200px] justify-start  flex-col h-full sm:p-8 p-4"
        }
      >
        <h1 className={"py-4 text-3xl font-bold"}>Admin</h1>

        <AdminNav />
        <Outlet />
      </div>
    </section>
  );
}

function AdminNav() {
  return (
    <nav className={"flex w-full h-16 border-gray-600 border-solid border"}>
      <ul className={"flex flex-row w-full items-center"}>
        <AdminListItem to={"/store/services"} itemName={"Services"} />
        <AdminListItem to={"/store/bookings"} itemName={"Bookings"} />
        <AdminListItem to={"/store/gallery"} itemName={"Gallery"} />
      </ul>
    </nav>
  );
}

type AdminListItemProps = {
  itemName: string;
  to: string;
};
export function AdminListItem({ itemName, to }: AdminListItemProps) {
  return (
    <li className={"px-4"}>
      <Link to={to}>{itemName}</Link>
    </li>
  );
}
