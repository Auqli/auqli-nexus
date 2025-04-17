import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { SimpleFooter } from "@/components/simple-footer"

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1a]">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Reset Password</h1>
            <p className="text-gray-400 mt-2">Create a new password for your account</p>
          </div>
          <ResetPasswordForm />
        </div>
      </div>
      <SimpleFooter />
    </div>
  )
}
