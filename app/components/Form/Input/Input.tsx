import { useField } from "remix-validated-form";

type MyInputProps = {
  name: string;
  label: string;
  type: string;
};

export const Input = ({ name, label, type }: MyInputProps) => {
  const { error, getInputProps } = useField(name);
  return (
    <>
      <label htmlFor={name}>{label}</label>
      <input {...getInputProps({ id: name, type })} />
      {error && <span className="text-red-600 text-base">{error}</span>}
    </>
  );
};
