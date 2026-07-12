import { useController, type Control, type FieldPath, type FieldPathValue, type FieldValues } from "react-hook-form";
import { useState, type ChangeEvent, type ReactNode } from 'react';
import { HiOutlineChevronDown, HiOutlineX } from 'react-icons/hi';

export interface InputLabelProps {
  children: ReactNode;
  htmlFor: string;
  className?: string;
}

export const InputLabel = ({ children, htmlFor, className = "" }: InputLabelProps) => {
  return (
    <label 
      htmlFor={htmlFor} 
      className={`block text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 ${className}`}
    >
      {children}
    </label>
  );
};

export interface TextInputInterface<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  defaultValue?: string | undefined;
  errMsg?: string;
  type?: string;
  row?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  placeholder?: string;
}

export const TextInputComponent = <TFieldValues extends FieldValues = FieldValues>({
  type = "text",
  control,
  name,
  defaultValue = "",
  errMsg,
  min,
  placeholder
}: TextInputInterface<TFieldValues>) => {
  const { field } = useController({
    control: control,
    name: name,
    defaultValue: defaultValue as FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
  });

  return (
    <div className="relative w-full">
      <input
        type={type}
        {...field}
        value={field.value ?? ""}
        min={min}
        placeholder={placeholder}
        className={`w-full px-4 h-12 border rounded-xl text-[13px] font-medium text-slate-800 bg-white outline-none ring-offset-2 transition-all duration-200 ${
          errMsg 
            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/5" 
            : "border-slate-200 focus:border-[#203f99] focus:ring-4 focus:ring-[#203f99]/5"
        }`}
      />
      {errMsg && (
        <p className="text-xs font-semibold text-red-500 mt-1.5 px-0.5">{errMsg}</p>
      )}
    </div>
  );
};

export const TextAreaInputComponent = <TFieldValues extends FieldValues = FieldValues>({
  row = 5,
  control,
  name,
  defaultValue = "",
  errMsg,
  placeholder
}: TextInputInterface<TFieldValues>) => {
  const { field } = useController({
    control: control,
    name: name,
    defaultValue: defaultValue as FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
  });

  return (
    <div className="relative w-full">
      <textarea
        {...field}
        value={field.value ?? ""}
        rows={row}
        placeholder={placeholder}
        style={{ resize: "vertical" }}
        className={`w-full px-4 py-3 border rounded-xl text-[13px] font-medium text-slate-800 placeholder-slate-400 bg-white outline-none transition-all duration-200 min-h-[100px] ${
          errMsg 
            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/5" 
            : "border-slate-200 focus:border-[#203f99] focus:ring-4 focus:ring-[#203f99]/5"
        }`}
      />
      {errMsg && (
        <p className="text-xs font-semibold text-red-500 mt-1.5 px-0.5">{errMsg}</p>
      )}
    </div>
  );
};

interface TagInputProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  defaultValue?: string[];
  errMsg?: string;
  placeholder?: string;
}

export const TagInputComponent = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  defaultValue = [],
  errMsg,
  placeholder = "Type skill and press Enter..."
}: TagInputProps<TFieldValues>) => {
  const { field } = useController({
    name,
    control,
    defaultValue: defaultValue as FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
  });

  const [inputValue, setInputValue] = useState('');
  const tags: string[] = Array.isArray(field.value) ? field.value : [];

  const addTag = (value: string) => {
    const tag = value.trim();
    if (!tag) return;
    if (!tags.includes(tag)) {
      field.onChange([...tags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    field.onChange(tags.filter((tag) => tag !== tagToRemove));
  };

  return (
    <div className="w-full">
      <div 
        className={`w-full rounded-xl border p-3 bg-white transition-all duration-200 ${
          errMsg 
            ? "border-red-500 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-500/5" 
            : "border-slate-200 focus-within:border-[#203f99] focus-within:ring-4 focus-within:ring-[#203f99]/5"
        }`}
      >
        <div className="flex flex-wrap gap-1.5 empty:hidden mb-2">
          {tags.map((tag) => (
            <span 
              key={tag} 
              className="inline-flex h-6 items-center rounded-lg bg-slate-100 px-2 text-xs font-bold text-slate-700 border border-slate-200/40 transition-colors hover:bg-slate-200"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-md text-slate-400 hover:bg-slate-300 hover:text-slate-800 transition-colors"
              >
                <HiOutlineX className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              addTag(inputValue.replace(/,$/, ''));
              setInputValue('');
            }
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="w-full bg-transparent px-0 py-0.5 text-[13px] font-medium text-slate-800 placeholder-slate-400 outline-none"
        />
      </div>
      {errMsg && (
        <p className="text-xs font-semibold text-red-500 mt-1.5 px-0.5">{errMsg}</p>
      )}
    </div>
  );
};

export interface OptionType {
  label: string;
  value: string;
}

export interface SelectOptionProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  errMsg?: string;
  options?: Array<OptionType>;
}

export const SelectOptionComponent = <TFieldValues extends FieldValues = FieldValues>({
  options,
  control,
  name,
  errMsg
}: SelectOptionProps<TFieldValues>) => {
  const { field } = useController({
    name: name,
    control: control,
    defaultValue: "" as FieldPathValue<TFieldValues, FieldPath<TFieldValues>>,
  });

  return (
    <div className="relative w-full">
      <select
        {...field}
        value={field.value ?? ""}
        className={`w-full px-4 h-10 border rounded-xl text-[13px] font-medium text-slate-800 bg-white outline-none appearance-none transition-all duration-200 ${
          errMsg 
            ? "border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/5" 
            : "border-slate-200 focus:border-[#203f99] focus:ring-4 focus:ring-[#203f99]/5"
        }`}
      >
        {options && options.map((row: OptionType, i: number) => (
          <option key={i} value={row.value}>{row.label}</option>
        ))}
      </select>
      <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
        <HiOutlineChevronDown className="h-4 w-4" />
      </div>
      {errMsg && (
        <p className="text-xs font-semibold text-red-500 mt-1.5 px-0.5">{errMsg}</p>
      )}
    </div>
  );
};

export const RoleSelectComponent = ({ control, name, errMsg }: SelectOptionProps) => {
  return (
    <SelectOptionComponent
      options={[
        { label: "Buyer", value: "customer" },
        { label: "Seller", value: "seller" }
      ]}
      control={control}
      name={name}
      errMsg={errMsg}
    />
  );
};

export interface ButtonProps {
  onClick?: () => void;
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

export const SubmitButton = ({ onClick, loading = false, children, className = "" }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      type="submit"
      className={`w-full h-10 rounded-xl bg-[#18317a] hover:bg-blue-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold transition-all duration-200 shadow-sm flex items-center justify-center gap-2 outline-none focus:ring-4 focus:ring-[#203f99]/15 active:scale-[0.98] ${className}`}
    >
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
      ) : (
        children
      )}
    </button>
  );
};

export const CancelButton = ({ onClick, loading = false, children, className = "" }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      type="button"
      className={`h-10 px-5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:bg-slate-50 text-slate-600 hover:text-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed text-sm font-bold transition-all duration-200 outline-none active:scale-[0.98] ${className}`}
    >
      {children}
    </button>
  );
};