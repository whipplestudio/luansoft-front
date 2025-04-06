"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  label: string
  value: string
  disabled?: boolean
  description?: string
}

export interface SearchableSelectProps {
  options: SelectOption[]
  selected: string | string[]
  onChange: (value: string | string[]) => void
  placeholder?: string
  multiple?: boolean
  showSearch?: boolean
  searchPlaceholder?: string
  noResultsMessage?: string
  clearButtonText?: string
  selectAllButtonText?: string
  maxHeight?: number
  isDisabled?: boolean
  disabledMessage?: string
  onSearchChange?: (value: string) => void
  searchValue?: string
}

export function SearchableSelect({
  options,
  selected,
  onChange,
  placeholder = "Seleccionar...",
  multiple = false,
  showSearch = true,
  searchPlaceholder = "Buscar...",
  noResultsMessage = "No se encontraron resultados",
  clearButtonText = "Limpiar selección",
  selectAllButtonText = "Seleccionar todos",
  maxHeight = 200,
  isDisabled = false,
  disabledMessage = "No disponible",
  onSearchChange,
  searchValue,
}: SearchableSelectProps) {
  // Add state for search query
  const [searchQuery, setSearchQuery] = useState(searchValue || "")
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Handle external search query changes (for controlled search)
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(searchQuery)
    }
  }, [searchQuery, onSearchChange])

  useEffect(() => {
    if (searchValue !== undefined) {
      setSearchQuery(searchValue)
    }
  }, [searchValue])

  // Filter options based on search query (only if onSearchChange is not provided)
  const filteredOptions = onSearchChange
    ? options
    : options.filter((option) => option.label.toLowerCase().includes(searchQuery.toLowerCase()))

  // Function to handle selection changes for multiple select
  const handleMultiSelectionChange = (value: string) => {
    // If the value is already selected, remove it, otherwise add it
    if ((selected as string[]).includes(value)) {
      onChange((selected as string[]).filter((item) => item !== value))
    } else {
      onChange([...(selected as string[]), value])
    }
  }

  // Function to handle selection changes for single select
  const handleSingleSelectionChange = (value: string) => {
    onChange(value)
    setIsOpen(false)
    setSearchQuery("") // Clear search query after selection
  }

  // Function to handle select all
  const handleSelectAll = () => {
    // Only select non-disabled options
    const allValues = filteredOptions.filter((option) => !option.disabled).map((option) => option.value)
    onChange(allValues)
  }

  // Function to clear selection
  const handleClearSelection = (e: React.MouseEvent) => {
    e.preventDefault()
    onChange(multiple ? [] : "")
  }

  // Get display value for trigger
  const getDisplayValue = () => {
    if (multiple) {
      return (selected as string[]).length > 0 ? `${(selected as string[]).length} seleccionados` : placeholder
    } else {
      if (!selected) return placeholder
      const selectedOption = options.find((option) => option.value === selected)
      return selectedOption ? selectedOption.label : placeholder
    }
  }

  // Handle search input change without losing focus
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation()
    setSearchQuery(e.target.value)
  }

  // Prevent dropdown from closing when clicking on search input
  const handleSearchClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false)
        setSearchQuery("") // Clear search query when closing
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  if (multiple) {
    // Render custom multiple select implementation
    return (
      <div className="relative">
        <Select disabled={isDisabled}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={placeholder}>{getDisplayValue()}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {/* Add search input at the top if showSearch is true */}
            {showSearch && (
              <div className="px-2 py-2 sticky top-0 bg-background z-10 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 h-8 text-sm"
                  />
                </div>
              </div>
            )}

            {isDisabled ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">{disabledMessage}</div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">{noResultsMessage}</div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight}px` }}>
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent hover:text-accent-foreground ${option.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => !option.disabled && handleMultiSelectionChange(option.value)}
                  >
                    <Checkbox
                      id={`select-${option.value}`}
                      checked={Array.isArray(selected) && selected.includes(option.value)}
                      className="mr-2 h-4 w-4"
                      disabled={option.disabled}
                    />
                    <div className="flex-grow">
                      <Label htmlFor={`select-${option.value}`} className="flex-grow cursor-pointer">
                        {option.label}
                      </Label>
                      {option.description && <p className="text-xs text-muted-foreground">{option.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {(selected as string[]).length > 0 && (
              <div className="border-t px-2 py-2 mt-2">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={handleClearSelection}>
                  {clearButtonText}
                </Button>
              </div>
            )}

            {filteredOptions.length > 1 && (
              <div className="border-t px-2 py-2">
                <Button variant="ghost" size="sm" className="w-full text-xs" onClick={handleSelectAll}>
                  {selectAllButtonText}
                </Button>
              </div>
            )}
          </SelectContent>
        </Select>
        {(selected as string[]).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {(selected as string[]).map((value) => {
              const option = options.find((opt) => opt.value === value)
              return option ? (
                <Badge key={value} variant="secondary" className="text-xs">
                  {option.label}
                  <button className="ml-1 text-xs" onClick={() => handleMultiSelectionChange(value)}>
                    ×
                  </button>
                </Badge>
              ) : null
            })}
          </div>
        )}
      </div>
    )
  } else {
    // Custom implementation for single select with better search handling
    return (
      <div className="relative" ref={dropdownRef}>
        <div
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            isOpen && "ring-2 ring-ring ring-offset-2",
          )}
          onClick={() => {
            if (!isDisabled) {
              setIsOpen(!isOpen)
              if (!isOpen) {
                // Reset search query when opening
                setSearchQuery("")
              }
            }
          }}
        >
          <div className="flex-1 truncate">{getDisplayValue()}</div>
          <div className="opacity-50">
            <svg
              width="15"
              height="15"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
            >
              <path
                d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.26618 11.9026 7.38064 11.95 7.49999 11.95C7.61933 11.95 7.73379 11.9026 7.81819 11.8182L10.0682 9.56819Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-50 w-full min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md animate-in fade-in-80 mt-1">
            {showSearch && (
              <div className="px-2 py-2 sticky top-0 bg-background z-10 border-b">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    ref={searchInputRef}
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClick={handleSearchClick}
                    className="pl-8 h-8 text-sm"
                    autoFocus
                  />
                </div>
              </div>
            )}

            {isDisabled ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">{disabledMessage}</div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-2 py-4 text-center text-sm text-muted-foreground">{noResultsMessage}</div>
            ) : (
              <div className="overflow-y-auto" style={{ maxHeight: `${maxHeight}px` }}>
                {filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    className={cn(
                      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                      option.value === selected
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground",
                      option.disabled && "pointer-events-none opacity-50",
                    )}
                    onClick={() => {
                      if (!option.disabled) {
                        handleSingleSelectionChange(option.value)
                      }
                    }}
                  >
                    <div className="flex-grow">
                      {option.label}
                      {option.description && <p className="text-xs text-muted-foreground">{option.description}</p>}
                    </div>
                    {option.value === selected && (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-2"
                      >
                        <path
                          d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    )
  }
}

