import { Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import type { ActionArgs, SerializeFrom } from "@remix-run/node";
import { prisma } from "~/db.server";
import invariant from "tiny-invariant";
import { json } from "@remix-run/node";
import type { StoreServices } from "@prisma/client";
import Toggle from "~/components/toggle/Toggle";
import type { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export async function loader() {
  const store = await prisma.store.findFirst();
  invariant(store, "No store found");
  const storeServices = await prisma.storeServices.findMany({
    where: {
      storeId: store.id,
    },
  });
  invariant(storeServices, "No store services found");
  return json({ storeServices });
}

export async function action({ request }: ActionArgs) {
  const body = new URLSearchParams(await request.text());
  const id = body.get("id");
  const enabled = body.get("enabled");
  invariant(id, "id is required");
  invariant(enabled, "enabled is required");
  const service = await prisma.storeServices.update({
    where: {
      id: id,
    },
    data: {
      enabled: enabled === "true",
    },
  });
  return json({ service });
}
export default function AdminServices() {
  const { storeServices } = useLoaderData<typeof loader>();
  return (
    <div className={"flex w-full h-full flex-row items-center"}>
      <ul className={"w-full flex flex-col h-full justify-evenly"}>
        {storeServices.map(service => {
          return <ServiceListItem service={service} />;
        })}
      </ul>
      <Outlet />
    </div>
  );
}

function ServiceListItem({
  service,
}: {
  service: SerializeFrom<StoreServices>;
}) {
  const fetcher = useFetcher();
  const onClick = () => {
    fetcher.submit(
      { id: service.id, enabled: JSON.stringify(!service.enabled) },
      {
        method: "patch",
        action: "/store/services",
      },
    );
  };
  return (
    <li
      className={
        "p-4 border border-solid border-gray-600 flex flex-row justify-between"
      }
      key={service.id}
    >
      <ListItemContainer className={"w-3/6"}>
        <span>{service.name}</span>
      </ListItemContainer>
      <ListItemContainer className={"justify-start"}>
        <span>{service.price}</span>
      </ListItemContainer>
      <ListItemContainer className={"justify-end px-4"}>
        <Toggle on={service.enabled} onClick={onClick} />
      </ListItemContainer>
    </li>
  );
}

export const ListItemContainer = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const classes = twMerge(`
flex flex-row justify-between items-center w-full
    ${className ?? ""}
  `);
  return <div className={classes}>{children}</div>;
};
