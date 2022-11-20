import {useSearchParams} from "@remix-run/react"

export default function Login() {
  const [params] = useSearchParams()

  return (
    <div>
      <h1>Login</h1>
      <form method={"post"}>
        <input
          type="hidden"
          name="redirectTo"
          value={params.get("redirectTo") ?? undefined}
        />
        <fieldset>
          <legend>Login or Register?</legend>
          <label>
            <input type="radio" name="loginType" value="login" defaultChecked />{" "}
            Login
          </label>
          <label>
            <input type="radio" name="loginType" value="register" /> Register
          </label>
        </fieldset>
        <div>
          <label htmlFor="email-input">Email</label>
          <input type={"email"} name={"email"} id={"email-input"} />
        </div>
        <div>
          <label htmlFor="password-input">Password</label>
          <input type={"password"} name={"password"} id={"password-input"} />
        </div>
        <button type={"submit"}>Submit</button>
      </form>
    </div>
  )
}
