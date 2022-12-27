import { prisma } from "~/db.server";
import bcrypt from "bcrypt";
import type { Prisma } from "@prisma/client";

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

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: {
      id,
    },
  });
}

export async function updateUserPassword(email: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return await prisma.user.update({
    where: {
      email,
    },
    data: {
      password: hashedPassword,
    },
  });
}
