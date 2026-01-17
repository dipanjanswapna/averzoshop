
'use client';

import { Address } from '@/types/address';
import { Button } from '@/components/ui/button';
import { Home, Briefcase, MapPin, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface AddressCardProps {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
}

const addressIcons = {
  Home: <Home size={16} />,
  Office: <Briefcase size={16} />,
  Other: <MapPin size={16} />,
};

export function AddressCard({ address, onEdit, onDelete }: AddressCardProps) {
  return (
    <div className="p-4 border rounded-xl flex justify-between items-start">
      <div className="flex items-start gap-4">
         <div className="bg-muted p-3 rounded-lg mt-1 text-muted-foreground">
            {addressIcons[address.label]}
        </div>
        <div>
            <div className="flex items-center gap-2">
                <span className="font-bold text-sm">{address.label}</span>
                {/* Optional: Add a 'Default' badge here if applicable */}
            </div>
            <p className="font-semibold mt-1 text-foreground">{address.name}, {address.phone}</p>
            <p className="text-sm text-muted-foreground">
                {address.streetAddress}, {address.area}
            </p>
            <p className="text-sm text-muted-foreground">
                {address.upazila}, {address.district}, {address.division}
            </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={onDelete} className="text-destructive">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
