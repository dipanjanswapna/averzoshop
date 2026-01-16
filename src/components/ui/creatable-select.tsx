
"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface CreatableSelectProps {
  options: { value: string; label: string }[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyPlaceholder?: string;
  createPlaceholder?: (value: string) => string;
  disabled?: boolean;
}

export function CreatableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyPlaceholder = "No results found.",
  createPlaceholder = (val) => `Create "${val}"`,
  disabled = false,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const handleSelect = (currentValue: string) => {
    onChange(currentValue.toLowerCase() === value?.toLowerCase() ? "" : currentValue)
    setOpen(false)
    setInputValue("")
  }

  const handleCreate = () => {
    if (inputValue) {
      onChange(inputValue);
      setOpen(false);
      setInputValue("");
    }
  }

  const currentOption = options.find((option) => option.value.toLowerCase() === value?.toLowerCase());
  const displayLabel = currentOption ? currentOption.label : value;

  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="truncate">{value ? displayLabel : placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList>
            <CommandEmpty>
                {inputValue ? (
                     <button
                        className="w-full text-left p-2 text-sm"
                        onClick={handleCreate}
                    >
                        {createPlaceholder(inputValue)}
                    </button>
                ) : (
                    <p className="p-2 text-sm text-center text-muted-foreground">{emptyPlaceholder}</p>
                )}
            </CommandEmpty>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={handleSelect}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value?.toLowerCase() === option.value.toLowerCase() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
