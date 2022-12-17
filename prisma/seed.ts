import {PrismaClient} from "@prisma/client"
import {faker} from "@faker-js/faker"
import bycript from "bcrypt"

const prisma = new PrismaClient()

//import faker and write a user factory function which generate random data for the user

function userFactory() {
  const hashedPassword = bycript.hash("password1", 10)

  return {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email: faker.internet.email(),
    password: hashedPassword,
    mobilePhone: faker.phone.number(),
    role: "USER",
  }
}
async function main() {
  await prisma.user.create({
    data: {
      firstName: "manos",
      lastName: "koukis",
      email: "emmanouil.e@hotmail.com",
      password: "$2a$04$2t9xcOy71K4QqkENc2NWS.c3sVrfrOKC8DSH5n39dDMbTb.HSLWEK",
      mobilePhone: "6971234567",
      role: "ADMIN",
    },
  })

  await prisma.store.create({
    data: {
      name: "Barber Shop 1963",
      address: "Grammou 12",
      city: "Kastoria",
      country: "Greece",
      postalCode: "52100",
      phone: faker.phone.number(),
      email: faker.internet.email(),
    },
  })
}

main()
