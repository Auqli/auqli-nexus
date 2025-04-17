import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { SimpleFooter } from "@/components/simple-footer"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1a]">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mb-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white">Forgot Password</h1>
            <p className="text-gray-400 mt-2">We'll help you reset your password</p>
          </div>
          <ForgotPasswordForm />
        </div>
      </div>
      <SimpleFooter />
    </div>
  )
}
