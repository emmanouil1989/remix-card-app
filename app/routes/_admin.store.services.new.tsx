import { withZod } from "@remix-validated-form/with-zod";
import zod from "zod";
import { ValidatedForm, validationError } from "remix-validated-form";
import { Input } from "~/components/Form/Input/Input";
import { SubmitButton } from "~/components/Form/SubmitButton/SubmitButton";
import type { ActionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { prisma } from "~/db.server";
import invariant from "tiny-invariant";

export async function action({ request }: ActionArgs) {
  const formData = await request.formData();
  const fieldValues = await validator.validate(formData);
  if (fieldValues.error) return validationError(fieldValues.error);
  const { name, price } = fieldValues.data;
  const store = await prisma.store.findFirst({});
  invariant(store, "No store found");
  await prisma.storeServices.create({
    data: {
      name,
      price: Number(price),
      store: {
        connect: {
          id: store.id,
        },
      },
    },
  });
  return redirect("/store/services");
}

const validator = withZod(
  zod.object({
    name: zod.string().min(1, { message: "Name is required" }),
    price: zod.string().min(1, { message: "Price is required" }),
  }),
);
export default function CreateService() {
  return (
    <section className={"flex h-full w-full pt-4 pl-8 "}>
      <ValidatedForm
        validator={validator}
        method={"post"}
        className={"flex flex-col gap-4 w-full h-full"}
      >
        <div className={"flex flex-col "}>
          <Input name={"name"} label={"Service Name:"} type={"text"} />
        </div>
        <div className={"flex flex-col "}>
          <Input name={"price"} label={"Price:"} type={"number"} />
        </div>
        <div>
          <SubmitButton
            submittingText={"Creating Service..."}
            submitText={"Create Service"}
          />
        </div>
      </ValidatedForm>
    </section>
  );
}
