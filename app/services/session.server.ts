import type { Cookie, CookieOptions } from "@remix-run/node";
import { createSessionStorage } from "@remix-run/node";
import { prisma } from "~/db.server";
import invariant from "tiny-invariant";

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set");

const SESSION_EXPIRES = 60 * 60 * 24; // 1 day

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
      await clearSessions();
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
  maxAge: SESSION_EXPIRES,
  secrets: [process.env.SESSION_SECRET],
  secure: process.env.NODE_ENV === "production",
});

async function clearSessions() {
  const date = new Date();
  date.setDate(date.getDate() - 8);
  await prisma.session.deleteMany({
    where: {
      expirationDate: {
        lte: date,
      },
    },
  });
}

export const setCookieExpires = () => {
  let utcTimeStamp = new Date();
  let epochTime = utcTimeStamp.getTime() / 1000.0;
  let timestamp = Math.floor(epochTime + SESSION_EXPIRES);
  let expires = new Date(timestamp * 1000);

  return expires;
};

export const expiresToSeconds = (expires: Date | null): number | null => {
  if (!expires) {
    return null;
  }
  let utcTimeStamp = new Date(expires);
  let epochTime = utcTimeStamp.getTime() / 1000.0;

  return Math.floor(epochTime + SESSION_EXPIRES);
};
