"use client"
import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { LogOut, BarChart3, User, Code2 } from "lucide-react"

export function Header() {
  const { data: session, status } = useSession()

  const getInitials = (name?: string | null, email?: string | null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    }
    return email?.[0]?.toUpperCase() || "U"
  }

  const formatLastLogin = (lastLoginAt?: string) => {
    if (!lastLoginAt) return "Never"
    const date = new Date(lastLoginAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center">
        {/* Logo and Brand */}
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">Constrainly</span>
              <span className="text-xs text-muted-foreground leading-tight">Test Case Generator</span>
            </div>
          </Link>
        </div>

        {/* Mobile Logo */}
        <div className="mr-4 flex md:hidden">
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Code2 className="h-5 w-5" />
            </div>
            <span className="font-bold text-lg">Constrainly</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* You can add navigation items here if needed */}
          </div>

          <nav className="flex items-center space-x-2">
            {status === "loading" ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                <div className="hidden sm:block h-4 w-20 animate-pulse rounded bg-muted" />
              </div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                {/* Welcome message - hidden on mobile */}
                <div className="hidden lg:flex flex-col items-end">
                  <span className="text-sm font-medium">Welcome back!</span>
                  <span className="text-xs text-muted-foreground">{session.user?.name || "User"}</span>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full ring-2 ring-transparent hover:ring-border transition-all"
                    >
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                          {getInitials(session.user?.name, session.user?.email)}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {getInitials(session.user?.name, session.user?.email)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium leading-none">{session.user?.name || "User"}</p>
                            <p className="text-xs leading-none text-muted-foreground mt-1">{session.user?.email}</p>
                          </div>
                        </div>
                        {(session as any)?.lastLoginAt && (
                          <Badge variant="secondary" className="text-xs w-fit">
                            Last login: {formatLastLogin((session as any).lastLoginAt)}
                          </Badge>
                        )}
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile & Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Analytics Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600 focus:text-red-600"
                      onSelect={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button asChild variant="ghost" size="sm">
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/auth/signin">Get Started</Link>
                </Button>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
