export default function VerifyPage() {
  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center mx-auto mb-6">
          <span className="text-2xl">✉️</span>
        </div>
        <h1 className="text-2xl font-black mb-2">Check your email</h1>
        <p className="text-muted leading-relaxed">
          We've sent a magic link to your email address. Click it to sign in —
          no password required.
        </p>
        <p className="text-xs text-muted mt-4">
          The link expires in 10 minutes. Check your spam folder if you don't see it.
        </p>
      </div>
    </div>
  );
}
