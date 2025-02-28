import { Suspense } from "react"
import { AuthContainer } from "@/components/ui/auth-container"
import { ResetPasswordForm } from "@/components/reset-password-form"

function ResetPasswordContent() {
  return (
    <AuthContainer>
      <ResetPasswordForm />
    </AuthContainer>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}