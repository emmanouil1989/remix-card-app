import React from "react"
import Button from "~/components/button/Button"
export default function Register() {
  return (
    <section className={"flex items-center justify-center h-full flex-col"}>
      <h1>Register</h1>
      <form
        method={"post"}
        className={"flex flex-col items-start justify-between w-3/12"}
      >
        <div className={"flex flex-col w-full justify-between py-4"}>
          <label htmlFor={"first-name-input"}>First Name:</label>
          <input
            className={"block"}
            type={"text"}
            name={"name"}
            id={"name-input"}
          />
        </div>
        <div className={"flex flex-col w-full justify-between py-4"}>
          <label htmlFor={"last-name-input"}>Last Name:</label>
          <input type={"text"} name={"name"} id={"name-input"} />
        </div>
        <div className={"flex flex-col w-full justify-between py-4"}>
          <label htmlFor="email-input">Email:</label>
          <input type={"email"} name={"email"} id={"email-input"} />
        </div>
        <div className={"flex flex-col w-full justify-between py-4"}>
          <label htmlFor="password-input">Password:</label>
          <input type={"password"} name={"password"} id={"password-input"} />
        </div>
        <div className={"flex flex-col w-full justify-between py-4"}>
          <label htmlFor={"mobile-input"}>Mobile:</label>
          <input type={"tel"} name={"mobile"} id={"mobile-input"} />
        </div>
        <div className={"flex justify-center w-full items-center"}>
          <Button type={"submit"}>Register</Button>
        </div>
      </form>
    </section>
  )
}
