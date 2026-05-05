import { useState } from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSearch: (value: string) => void;
  initialValue?: string;
}

export function SearchBar({ onSearch, initialValue = '' }: Props) {
  const [val, setVal] = useState(initialValue);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(val.trim());
  };

  return (
    <form onSubmit={submit} className="search-bar">
      <Search size={15} color="hsl(256 22% 45%)" />
      <input
        type="search"
        placeholder="Search products…"
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => onSearch(val.trim())}
      />
    </form>
  );
}
