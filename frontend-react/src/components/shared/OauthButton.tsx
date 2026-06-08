import { Button } from '../ui/button'
import { GitHubIcon, GoogleIcon } from './icon'

type OauthButtonProps = {
  isSubmitting: boolean
  onGoogleSignIn: () => void
}

const OauthButton = ({ isSubmitting, onGoogleSignIn }: OauthButtonProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
        disabled={isSubmitting}
        onClick={onGoogleSignIn}>
        <GoogleIcon className="mr-2 size-5" />
        Google
      </Button>
      <Button
        type="button"
        variant="outline"
        className="h-12 rounded-xl border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300"
        disabled={isSubmitting}>
        <GitHubIcon className="mr-2 size-5" />
        GitHub
      </Button>
    </div>
  )
}

export default OauthButton
