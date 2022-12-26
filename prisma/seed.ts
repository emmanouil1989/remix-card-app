import { PrismaClient, Role, Prisma, StoreServices } from "@prisma/client";
import { faker } from "@faker-js/faker";
import bycript from "bcrypt";

const prisma = new PrismaClient();

const services = ["Male Haircut", "Beard Trim", "Shave", "Haircut & Hair Wash"];

async function userFactory(
  index: number,
  storeId: string,
): Promise<Prisma.UserCreateInput> {
  const hashedPassword = await bycript.hash("password1", 10);
  const service = await serviceFactory();
  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: `pelatis${index}@gmail.com`,
    password: hashedPassword,
    mobilePhone: faker.phone.number(),
    emailVerifiedAt: faker.date.past(),
    role: Role.USER,
    bookings: {
      create: bookingsFactory(storeId, service),
    },
  };
}

const serviceFactory = async (): Promise<Prisma.ServiceCreateInput> => {
  const services = await prisma.storeServices.findMany();
  const storeService = getRandomService(services);
  return {
    storeService: {
      connect: {
        id: storeService.id,
      },
    },
  };
};

function getRandomService(services: Array<StoreServices>) {
  return services[Math.floor(Math.random() * services.length)];
}

function bookingsFactory(
  storeId: string,
  service: Prisma.ServiceCreateInput,
): Array<Prisma.BookingCreateWithoutUserInput> {
  return [
    {
      store: {
        connect: {
          id: storeId,
        },
      },
      services: {
        create: {
          ...service,
        },
      },
      start: faker.date.future(),
      end: faker.date.future(),
    },
  ];
}

function storeServicesFactory(): Array<Prisma.StoreServicesCreateWithoutStoreInput> {
  return services.map(function mapToService(serviceName) {
    return {
      name: serviceName,
      price: Number(faker.commerce.price()),
    };
  });
}

async function main() {
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();
  await prisma.service.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.store.create({
    data: {
      name: "Barber Shop 1963",
      address: "Grammou 12",
      city: "Kastoria",
      country: "Greece",
      postalCode: "52100",
      phone: faker.phone.number(),
      email: faker.internet.email(),
      storeServices: {
        create: storeServicesFactory(),
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
