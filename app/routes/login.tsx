import {useSearchParams} from "@remix-run/react"

export default function Login() {
  const [params] = useSearchParams()

  return (
    <section
      className={"w-full h-full flex justify-center items-center flex-col"}
    >
      <h1>Login</h1>
      <form method={"post"} className={"border bg-gray-400 w-1/6 h-1/6"}>
        <input
          type="hidden"
          name="redirectTo"
          value={params.get("redirectTo") ?? undefined}
        />
        <div>
          <label htmlFor="email-input">Email</label>
          <input type={"email"} name={"email"} id={"email-input"} />
        </div>
        <div>
          <label htmlFor="password-input">Password</label>
          <input type={"password"} name={"password"} id={"password-input"} />
        </div>

        <button type={"submit"}>Sign up</button>
        <button type={"submit"}>Login</button>
      </form>
    </section>
  )
}
