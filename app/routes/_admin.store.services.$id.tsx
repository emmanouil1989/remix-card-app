import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import { useLoaderData } from "@remix-run/react";
import { withZod } from "@remix-validated-form/with-zod";
import zod from "zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { Input } from "~/components/Form/Input/Input";
import Toggle from "~/components/toggle/Toggle";
import { useState } from "react";
import { SubmitButton } from "~/components/Form/SubmitButton/SubmitButton";

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
  const fieldValues = await Validator.validate(await request.formData());
  if (fieldValues.error) return validationError(fieldValues.error);
  const { name, price, enabled } = fieldValues.data;

  await prisma.storeServices.update({
    where: { id: serviceId },
    data: {
      name,
      price: Number(price),
      enabled: Boolean(enabled),
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
  const [toggle, setToggle] = useState(service.enabled);
  return (
    <section className={"flex flex-col w-full h-full pt-4 items-center"}>
      <h1>{service.name}</h1>
      <ValidatedForm
        validator={Validator}
        method={"post"}
        className={"flex flex-col gap-4 h-full w-full p-8"}
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
        <div className={"flex  gap-4"}>
          <label htmlFor={"enabled"}>Enabled:</label>
          <Toggle
            name={"enabled"}
            on={toggle}
            onClick={() => setToggle(!toggle)}
          />
        </div>
        <div className={"flex flex-col gap-4"}>
          <SubmitButton
            submitText={"Update Service"}
            submittingText={"Updating your service"}
          />
        </div>
      </ValidatedForm>
    </section>
  );
}
