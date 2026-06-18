import { Button } from '../ui/button'
import { GitHubIcon, GoogleIcon } from './icon'

type OauthButtonProps = {
  isSubmitting: boolean
  onGoogleSignIn: () => void
}

const OauthButton = ({ isSubmitting, onGoogleSignIn }: OauthButtonProps) => {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-xl border-border bg-background text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
        disabled={isSubmitting}
        onClick={onGoogleSignIn}
      >
        <GoogleIcon className="size-5" aria-hidden />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-xl border-border bg-background text-sm font-semibold text-foreground shadow-xs transition-colors hover:bg-muted"
        disabled={isSubmitting}
      >
        <GitHubIcon className="size-5" aria-hidden />
        GitHub
      </Button>
    </div>
  )
}

export default OauthButton
