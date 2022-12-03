import {useSearchParams} from "@remix-run/react"
import Button from "~/components/button/Button"

export default function Login() {
  const [params] = useSearchParams()

  return (
    <section
      className={"w-full h-full flex justify-center items-center flex-col"}
    >
      <h1>Login</h1>
      <form method={"post"} className={" min-h-max p-8 w-3/12 "}>
        <input
          type="hidden"
          name="redirectTo"
          value={params.get("redirectTo") ?? undefined}
        />
        <div className={"flex flex-col justify-between py-4"}>
          <label htmlFor="email-input">Email:</label>
          <input type={"email"} name={"email"} id={"email-input"} />
        </div>
        <div className={"flex flex-col justify-between py-4"}>
          <label htmlFor="password-input">Password:</label>
          <input type={"password"} name={"password"} id={"password-input"} />
        </div>
        <div className={"flex row justify-between items-center w-full"}>
          <Button type={"submit"}>Sign up</Button>
          <Button type={"submit"}>Login</Button>
        </div>
      </form>
    </section>
  )
}
