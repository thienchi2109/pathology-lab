'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  showIcon?: boolean
  className?: string
}

export function SignOutButton({ 
  variant = 'ghost', 
  showIcon = true,
  className 
}: SignOutButtonProps) {
  const { signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <Button
      variant={variant}
      onClick={handleSignOut}
      className={className}
    >
      {showIcon && <LogOut className="h-4 w-4" />}
      Đăng xuất
    </Button>
  )
}
