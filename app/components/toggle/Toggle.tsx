import React from "react";
import { Input } from "~/components/Form/Input/Input";

export default function Toggle(props: SwitchProps) {
  return <Switch {...props} />;
}

type SwitchProps = {
  on: boolean;
  onClick: () => void;
  name?: string;
};
function Switch({ on, onClick, name }: SwitchProps) {
  return (
    <div
      onClick={onClick}
      className={`
            relative inline-flex items-center h-8 rounded-full w-14
            ${on ? "bg-green-500" : "bg-gray-200"}
        
        `}
    >
      {name && (
        <Input name={name} label={""} type={"text"} className={"hidden"} />
      )}
      <span
        className={`
            w-6 h-6 transform bg-white rounded-full
            transition-transform ease-in-out duration-200
            ${on ? "translate-x-7" : "translate-x-1"}
            `}
      />
    </div>
  );
}
