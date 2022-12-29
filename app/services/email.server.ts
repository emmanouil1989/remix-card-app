import invariant from "tiny-invariant";
invariant(process.env.MAILGUN_API_KEY, "MAILGUN_API_KEY is required");
invariant(process.env.MAILGUN_DOMAIN, "MAILGUN_DOMAIN is required");

type SendEmailOptions = {
  to: string;
  subject: string;
  html: string;
  text: string;
};
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const auth = `${Buffer.from(`api:${process.env.MAILGUN_API_KEY}`).toString(
    "base64",
  )}`;

  const body = new URLSearchParams({
    to,
    from: "hello@barbershop1963.com",
    subject,
    text,
    html,
  });

  return fetch(
    `https://api.eu.mailgun.net/v3/${process.env.MAILGUN_DOMAIN}/messages`,
    {
      method: "post",
      body,
      headers: {
        Authorization: `Basic ${auth}`,
      },
    },
  );
}
