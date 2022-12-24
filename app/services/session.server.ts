import type { Cookie, CookieOptions } from "@remix-run/node";
import { createSessionStorage } from "@remix-run/node";
import { prisma } from "~/db.server";
import invariant from "tiny-invariant";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

const SESSION_EXPIRES = 60 * 2;

export const createDatabaseSessionStorage = (
  cookie:
    | Cookie
    | (CookieOptions & {
        name?: string;
      }),
) => {
  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      const session = await prisma.session.create({
        data: {
          user: {
            connect: {
              id: data.userId,
            },
          },
          expirationDate: expires,
        },
      });
      return session.id;
    },
    async readData(id) {
      const session = await prisma.session.findUnique({
        where: { id },
      });

      return session;
    },
    async updateData(id, data, expires) {
      await prisma.session.update({
        where: { id },
        data: {
          userId: data.user.id,
          expirationDate: expires,
        },
      });
    },
    async deleteData(id) {
      await prisma.session.delete({
        where: { id },
      });
    },
  });
};

export const sessionStorage = createDatabaseSessionStorage({
  name: "__session",
  sameSite: "lax",
  path: "/",
  httpOnly: true,
  maxAge: 60 * 2, // 4 minutes
  secrets: [process.env.SESSION_SECRET],
  secure: process.env.NODE_ENV === "production",
});

export const setCookieExpires = () => {
  let utcTimeStamp = new Date();
  let epochTime = utcTimeStamp.getTime() / 1000.0;
  let timestamp = Math.floor(epochTime + SESSION_EXPIRES);
  let expires = new Date(timestamp * 1000);

  return expires;
};
