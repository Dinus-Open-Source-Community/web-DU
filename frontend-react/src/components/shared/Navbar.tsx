import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut, Menu, UserCircle } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import { Button } from '../ui/button'
import { navLinks } from '../../lib/navigation'
import type { IUser, UserRole } from '../../lib/types/user'

// const roleNav: Record<UserRole, ReturnType<typeof flattenNavItems>> = {
//   student: flattenNavItems(Navigation.student),
//   mentor: flattenNavItems(Navigation.mentor),
//   admin: flattenNavItems(Navigation.admin),
// }

function userInitials(nama: string): string {
  const parts = nama.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()

  // Mock state - user to implement real auth later
  const isLoggedIn = false
  const user: IUser = {
    nama: 'User Name',
    email: 'user@example.com',
    avatar: '',
    role: 'student',
  }
  const roleLabel: Record<UserRole, string> = {
    student: 'Siswa',
    mentor: 'Mentor',
    admin: 'Admin',
  }
  // const flatNav = useMemo(() => roleNav[user.role], [user.role])

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const handleLogout = () => {
    setIsMenuOpen(false)
    navigate('/auth/login')
  }

  const handleProfile = () => {
    setIsMenuOpen(false)
    navigate('/profile')
  }

  return (
    <nav className="bg-primary text-popover fixed top-0 left-0 z-50 w-full shadow-md">
      <div className="container mx-auto flex w-full items-center justify-between px-4 py-4 md:px-8 lg:px-20">
        <Link to="/" className="text-2xl font-bold text-white">
          Doscom University
        </Link>

        <div className="hidden items-center lg:flex">
          <div className="flex w-full flex-wrap items-center justify-center gap-2">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.href}
                to={navLink.href}
                className={`flex items-center justify-center rounded-2xl py-2 text-lg font-medium transition-all ${
                  pathname === navLink.href ? 'bg-popover text-primary px-6' : 'px-4 text-white hover:text-white/80'
                }`}>
                {navLink.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="hidden items-center gap-4 lg:flex">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 py-1.5 pr-3 pl-1.5 text-white outline-none transition hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white/60">
                  <Avatar className="size-9 ring-2 ring-white/35">
                    {user.avatar ? <AvatarImage src={user.avatar} alt={user.nama} /> : null}
                    <AvatarFallback className="bg-white/25 text-xs font-bold text-white">{userInitials(user.nama)}</AvatarFallback>
                  </Avatar>
                  <span className="max-w-[140px] truncate text-left text-sm font-medium">{user.nama}</span>
                  <ChevronDown className="size-4 shrink-0 opacity-80" aria-hidden />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="truncate text-sm font-semibold">{user.nama}</span>
                    <span className="text-muted-foreground text-xs">{user.email}</span>
                    <span className="text-muted-foreground text-xs">{roleLabel[user.role]}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* {flatNav.map((item) => {
                  const Icon = item.icon
                  return (
                    <DropdownMenuItem key={`${item.path}-${item.name}`} asChild>
                      <Link to={item.path} className="flex cursor-pointer items-center gap-2">
                        {Icon ? <Icon className="size-4 opacity-70" /> : null}
                        {item.name}
                      </Link>
                    </DropdownMenuItem>
                  )
                })} */}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex cursor-pointer items-center gap-2">
                    <UserCircle className="size-4 opacity-70" />
                    Profil
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" className="cursor-pointer" onClick={handleLogout}>
                  <LogOut className="size-4" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-3">
              <Link to="/auth/register">
                <Button className="bg-transparent text-white hover:bg-white/10 border-white/30 rounded-2xl px-7" variant="outline">
                  Daftar
                </Button>
              </Link>
              <Link to="/auth/login">
                <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl px-7" variant="secondary">
                  Masuk
                </Button>
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-2xl border border-white/40 px-3 py-2 text-white lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setIsMenuOpen((prev) => !prev)}>
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col gap-3 px-6 pb-8 bg-primary">
          {isLoggedIn && (
            <div className="flex items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-3 py-2">
              <Avatar className="size-10 ring-2 ring-white/35">
                {user.avatar ? <AvatarImage src={user.avatar} alt={user.nama} /> : null}
                <AvatarFallback className="bg-white/25 text-xs font-bold text-white">{userInitials(user.nama)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{user.nama}</p>
                <p className="text-xs text-white/75">{roleLabel[user.role]}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-2">
            {navLinks.map((navLink) => (
              <Link
                key={navLink.href}
                to={navLink.href}
                className={`px-4 py-2 text-base transition ${pathname === navLink.href ? 'bg-white text-primary rounded-2xl font-medium' : 'text-white hover:text-white/80'}`}
                onClick={() => setIsMenuOpen(false)}>
                {navLink.label}
              </Link>
            ))}
          </div>
          {isLoggedIn ? (
            <div className="flex flex-col gap-1 border-t border-white/20 pt-3">
              <p className="px-4 text-xs font-semibold tracking-wide text-white/60 uppercase">Menu akun</p>
              {/* {flatNav.map((item) => {
                const Icon = item.icon
                return (
                  <Link key={`m-${item.path}-${item.name}`} to={item.path} className="flex items-center gap-2 px-4 py-2 text-base text-white hover:text-white/85" onClick={() => setIsMenuOpen(false)}>
                    {Icon ? <Icon className="size-4 shrink-0 opacity-80" /> : null}
                    {item.name}
                  </Link>
                )
              })} */}
              <button type="button" className="flex items-center gap-2 px-4 py-2 text-left text-base text-white hover:text-white/85" onClick={handleProfile}>
                <UserCircle className="size-4 shrink-0 opacity-80" />
                Profil
              </button>
              <button type="button" className="flex items-center gap-2 px-4 py-2 text-left text-base text-red-200 hover:text-red-100" onClick={handleLogout}>
                <LogOut className="size-4 shrink-0" />
                Keluar
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 pt-2">
              <Link to="/auth/register" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-transparent text-white hover:bg-white/10 border-white/30 rounded-2xl" variant="outline">
                  Daftar
                </Button>
              </Link>
              <Link to="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-2xl" variant="secondary">
                  Masuk
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
