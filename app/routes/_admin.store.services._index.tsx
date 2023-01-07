import { prisma } from "~/db.server";
import invariant from "tiny-invariant";
import { redirect } from "@remix-run/node";

export async function loader() {
  const service = await prisma.storeServices.findFirst();
  invariant(service, "No service found");
  return redirect(`/store/services/${service.id}`);
}
export default function Index() {
  return <div>Admin</div>;
}
