import React, { useState } from "react";

export default function Toggle(props: SwitchProps) {
  return <Switch {...props} />;
}

type SwitchProps = {
  initialValue: boolean;
  value?: boolean;
  onClick?: () => void;
  name?: string;
};
function Switch({ initialValue, onClick, name }: SwitchProps) {
  const [on, setOn] = useState(initialValue);

  return (
    <div
      onClick={onClick ? onClick : () => setOn(!on)}
      className={`
            relative inline-flex items-center h-8 rounded-full w-14
            ${on ? "bg-green-500" : "bg-gray-200"}
        
        `}
    >
      {name && <input name={name} type={"hidden"} value={on.toString()} />}
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
