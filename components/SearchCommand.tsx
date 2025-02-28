import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command"
import { Search } from "lucide-react"
import type { Category, Room } from "@prisma/client"

interface SearchCommandProps {
  categories: Category[]
  rooms: Room[]
}

export function SearchCommand({ categories, rooms }: SearchCommandProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const runCommand = (command: () => unknown) => {
    setOpen(false)
    command()
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-72 "
        onClick={() => setOpen(true)}
      >
        <span className="hidden lg:inline-flex">Search schools or rooms...</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type to search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Categories">
            {categories.map((category) => (
              <CommandItem key={category.id} onSelect={() => runCommand(() => router.push(`/category/${category.id}`))}>
                <Search className="mr-2 h-4 w-4" />
                {category.name}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Rooms">
            {rooms.map((room) => (
              <CommandItem key={room.id} onSelect={() => runCommand(() => router.push(`/rooms/${room.id}`))}>
                <Search className="mr-2 h-4 w-4" />
                {room.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

