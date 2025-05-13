import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Input from "../inputs/input";
import { useRef, useState } from "react";

interface SearchFieldProps {
  defaultValue?: string;
  onChange?: (query: string) => void;
}

export const SearchField = (props: SearchFieldProps) => {
  const { defaultValue, onChange } = props;
  const [searchQuery, setSearchQuery] = useState<string>(defaultValue ?? "");
  const typingTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleUserStopTyping = (value: string) => {
    if (onChange) {
      onChange(value);
    }
  };

  const handleQueryChanged = (value: string) => {
    setSearchQuery(value);
    clearInterval(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      handleUserStopTyping(value);
      clearInterval(this);
    }, 250);
  };

  return (
    <div className="flex items-center gap-2">
      <MagnifyingGlassIcon className="text-primary size-6" />
      <Input
        id="search-field"
        value={searchQuery}
        type="search"
        onChange={el => handleQueryChanged(el.currentTarget.value)}
        placeholder="Type to search"
      />
    </div>
  );
};
