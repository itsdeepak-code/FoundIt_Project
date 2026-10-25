import {
  Backpack,
  BookOpen,
  GlassWater,
  IdCard,
  KeyRound,
  Laptop,
  Package,
  Shirt,
  Watch,
} from 'lucide-react';
import { useState } from 'react';

export const CATEGORY_ICONS = {
  Electronics: Laptop,
  'ID Cards': IdCard,
  Bags: Backpack,
  'Books and Stationery': BookOpen,
  Clothing: Shirt,
  Accessories: Watch,
  Keys: KeyRound,
  Bottles: GlassWater,
  Other: Package,
};

/** Shows the item's photo, or a category icon placeholder if there isn't one. */
export default function ItemImage({ item, className = '', iconSize = 'size-10' }) {
  const [failed, setFailed] = useState(false);
  const Icon = CATEGORY_ICONS[item.category] || Package;

  if (item.imageUrl && !failed) {
    return (
      <img
        src={item.imageUrl}
        alt={item.title}
        onError={() => setFailed(true)}
        className={`object-cover ${className}`}
        loading="lazy"
      />
    );
  }
  return (
    <div className={`flex items-center justify-center bg-slate-100 ${className}`} aria-hidden="true">
      <Icon className={`${iconSize} text-slate-400`} strokeWidth={1.5} />
    </div>
  );
}
