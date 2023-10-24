import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { TextField } from "./TextField";
import { useRef, useState } from "react";

interface SearchFieldProps {
  className?: string;
  onChange?: (query: string) => void;
}

export const SearchFiled = (props: SearchFieldProps) => {
  const { className, onChange } = props;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const typingTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleUserStopTyping = (value: string) => {
    if (onChange) {
      onChange(value);
    }
  }

  const handleQueryChanged = (value: string) => {
    setSearchQuery(value);
    clearInterval(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      handleUserStopTyping(value);
      clearInterval(this);
    }, 500);
  }

  return (
    <div className={className}>
      <div className="flex space-x-4">
        <MagnifyingGlassIcon className="w-5" />
        <TextField
          value={searchQuery}
          type="search"
          onChange={(el) => handleQueryChanged(el.target.value)}
          placeholder="Type to search"
        />
      </div>
    </div>
  )
}