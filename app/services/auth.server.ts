import { Authenticator } from "remix-auth";
import { sessionStorage } from "~/services/session.server";
import { FormStrategy } from "remix-auth-form";
import invariant from "tiny-invariant";
import { prisma } from "~/db.server";
import bcrypt from "bcrypt";
import { addDays } from "date-fns";
import { encrypt } from "~/services/encryption.server";

export const authenticator = new Authenticator<string | null>(sessionStorage, {
  sessionKey: "userId",
});

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email");
    invariant(email, "Email is required");
    const password = form.get("password");

    invariant(typeof email === "string", "email must be a string");
    invariant(email.length > 0, "email must not be empty");

    invariant(typeof password === "string", "password must be a string");
    invariant(password.length > 0, "password must not be empty");
    const user = await login(email, password);

    return user ? user.id : null;
  }),
  "user-login",
);

export const login = async (email: string, hashedPassword: string) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return null;
  }
  const isCorrectPassword = await bcrypt.compare(hashedPassword, user.password);
  if (!isCorrectPassword) return null;

  return user;
};

export const createVerificationToken = async (userId: string) => {
  const expDate = addDays(new Date(), 7);
  const token = encrypt(userId);

  return await prisma.verificationToken.create({
    data: {
      userId: userId,
      expires: expDate,
      token,
    },
  });
};
