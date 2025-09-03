"use client";

import { useState } from "react";

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  buttonClassName?: string;
  icon?: React.ReactNode;
  defaultValue?: string; 
  onSearch: (value: string) => Promise<void> | void; // Support async
}

export default function SearchBar({
  placeholder,
  className,
  inputClassName,
  buttonClassName,
  icon,
  defaultValue = "",
  onSearch
}: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState(defaultValue);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim() || loading) return;
    setLoading(true);

    try {
      await onSearch(searchTerm.trim()); // Call parent's search function
    } finally {
      setLoading(false); // Stop loader after search
    }
  };

  return (
    <div className={className}>
      <input
        type="text"
        placeholder={placeholder}
        className={inputClassName}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        disabled={loading}
      />
      <button
        className={buttonClassName}
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          icon
        )}
      </button>
    </div>
  );
}
