import LoginForm from "@/components/login-form"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900/30 to-rose-900/30 bg-fixed">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wine Manager</h1>
          <p className="text-white/80">Manage your wine collection with style</p>
        </div>
        <LoginForm />
      </div>
    </main>
  )
}
