import { prisma } from "~/db.server";
import bcrypt from "bcrypt";
import { Prisma, User } from "@prisma/client";

export async function getUserByEmailAddress(emailAddress: string) {
  return await prisma.user.findUnique({
    where: {
      email: emailAddress,
    },
  });
}

export async function registerUser({
  firstName,
  lastName,
  email,
  password,
  mobilePhone,
}: Prisma.UserCreateInput) {
  const hashedPassword = await bcrypt.hash(password, 10);
  return await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      mobilePhone,
    },
  });
}
