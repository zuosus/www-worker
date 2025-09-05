'use client'

'use client'

import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import * as CookieConsent from 'vanilla-cookieconsent'

function Footer() {
  const handleManageCookies = () => {
    CookieConsent.showPreferences()
  }

  return (
    <div className="flex flex-col space-y-2">
      <Label className="text-xs text-muted-foreground">
        copyright &copy; 2025 all rights reserved
      </Label>
      <Button
        variant={'ghost'}
        onClick={handleManageCookies}
        className="text-xs p-0 h-auto bg-transparent border-none text-left cursor-pointer hover:underline text-muted-foreground"
        style={{ width: 'fit-content' }}
      >
        Manage Cookies
      </Button>
    </div>
  )
}

export { Footer }
