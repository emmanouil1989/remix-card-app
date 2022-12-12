import {ComponentPropsWithRef, MouseEvent, PropsWithChildren} from "react"

export type ButtonProps = ComponentPropsWithRef<"button">
export default function Button({onClick, children}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
    >
      {children}
    </button>
  )
}
