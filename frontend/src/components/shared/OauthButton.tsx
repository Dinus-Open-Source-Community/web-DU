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
        variant="neobrutalism"
        className="h-12 rounded-[10px] border-2 bg-paper-white px-5 font-extrabold hover:bg-paper-paper active:translate-y-[3px]"
        disabled={isSubmitting}
        onClick={onGoogleSignIn}
      >
        <GoogleIcon className="size-5" aria-hidden />
        Google
      </Button>
      <Button
        type="button"
        variant="neobrutalism"
        className="h-12 rounded-[10px] border-2 bg-paper-white px-5 font-extrabold hover:bg-paper-paper active:translate-y-[3px]"
        disabled={isSubmitting}
      >
        <GitHubIcon className="size-5" aria-hidden />
        GitHub
      </Button>
    </div>
  )
}

export default OauthButton
