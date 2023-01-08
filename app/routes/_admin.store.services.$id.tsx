import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { useLoaderData, useTransition } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import zod from "zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { Input } from "~/components/Form/Input/Input";
import Toggle from "~/components/toggle/Toggle";
import Button from "~/components/button/Button";

const Validator = withZod(
  zod.object({
    name: zod.string().min(1, { message: "Name is required" }),
    price: zod.string().min(1, { message: "Price is required" }),
    enabled: zod.string(),
  }),
);

export async function action({ request, params }: ActionArgs) {
  const serviceId = params.id;
  invariant(serviceId, "Service ID is required");
  const formData = await request.formData();
  const isDelete = formData.get("intent");
  if (isDelete === "delete") {
    await prisma.storeServices.delete({
      where: {
        id: serviceId,
      },
    });
    return redirect("/store/services");
  }
  const fieldValues = await Validator.validate(formData);
  if (fieldValues.error) return validationError(fieldValues.error);
  const { name, price, enabled } = fieldValues.data;
  await prisma.storeServices.update({
    where: { id: serviceId },
    data: {
      name,
      price: Number(price),
      enabled: enabled === "true",
    },
  });
  return redirect("/store/services");
}

export async function loader({ params }: LoaderArgs) {
  const serviceId = params.id;
  invariant(serviceId, "serviceId is required");
  const service = await prisma.storeServices.findUnique({
    where: {
      id: serviceId,
    },
  });
  invariant(service, "No service found");
  return json({ service });
}

export default function ViewServicePage() {
  const { service } = useLoaderData<typeof loader>();

  const transition = useTransition();
  const isUpdating = transition.submission?.formData.get("intent") === "update";
  const isDeleting = transition.submission?.formData.get("intent") === "delete";
  return (
    <section className={"flex flex-col w-full h-full pt-4 items-center p-8"}>
      <h1>{service.name}</h1>
      <ValidatedForm
        key={service.id}
        validator={Validator}
        method={"post"}
        className={"flex flex-col gap-4 w-full h-full"}
        defaultValues={{
          name: service.name,
          price: service.price.toString(),
          enabled: service.enabled.toString(),
        }}
      >
        <div className={"flex flex-col "}>
          <Input name={"name"} label={"Service Name:"} type={"text"} />
        </div>
        <div className={"flex flex-col "}>
          <Input name={"price"} label={"Price:"} type={"number"} />
        </div>
        <div key={service.id} className={"flex  gap-4"}>
          <label htmlFor={"enabled"}>Enabled:</label>
          <Toggle name={"enabled"} initialValue={service.enabled} />
        </div>
        <div className={"flex flex-row gap-4"}>
          <Button
            type={"submit"}
            className={"button"}
            name={"intent"}
            value={"update"}
          >
            {isUpdating ? "Updating your service..." : "Update Service"}
          </Button>
          <Button
            type={"submit"}
            name={"intent"}
            value={"delete"}
            className={"bg-red-600 hover:bg-red-700"}
          >
            {isDeleting ? "Deleting service..." : "Delete Service"}
          </Button>
        </div>
      </ValidatedForm>
    </section>
  );
}
