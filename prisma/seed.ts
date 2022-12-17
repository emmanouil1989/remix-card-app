import { PrismaClient, Role, Prisma } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bycript from "bcrypt";

const prisma = new PrismaClient();

async function userFactory(
  index: number,
  storeId: string,
): Promise<Prisma.UserCreateInput> {
  const hashedPassword = await bycript.hash("password1", 10);

  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: `pelatis${index}@gmail.com`,
    password: hashedPassword,
    mobilePhone: faker.phone.number(),
    role: Role.USER,
    bookings: {
      create: bookingsFactory(storeId),
    },
  };
}

function bookingsFactory(
  storeId: string,
): Array<Prisma.BookingCreateWithoutUserInput> {
  return [
    {
      store: {
        connect: {
          id: storeId,
        },
      },
      start: faker.date.future(),
      end: faker.date.future(),
    },
  ];
}

function servicesFactory(): Array<Prisma.ServiceCreateWithoutStoreInput> {
  return ["Male Haircut", "Beard Trim", "Shave", "Haircut & Hair Wash"].map(
    function mapToService(serviceName) {
      return {
        name: serviceName,
        price: Number(faker.commerce.price()),
      };
    },
  );
}

async function main() {
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.store.create({
    data: {
      name: "Barber Shop 1963",
      address: "Grammou 12",
      city: "Kastoria",
      country: "Greece",
      postalCode: "52100",
      phone: faker.phone.number(),
      email: faker.internet.email(),
      services: {
        create: servicesFactory(),
      },
    },
  });

  const store = await prisma.store.findFirst();

  if (store) {
    for (let i = 0; i < 10; i++) {
      await prisma.user.create({
        data: await userFactory(i + 1, store.id),
      });
    }
  }

  await prisma.user.create({
    data: {
      firstName: "manos",
      lastName: "koukis",
      email: "emmanouil.e@hotmail.com",
      password: "$2a$04$2t9xcOy71K4QqkENc2NWS.c3sVrfrOKC8DSH5n39dDMbTb.HSLWEK",
      mobilePhone: "6971234567",
      role: Role.ADMIN,
    },
  });
}

main();
