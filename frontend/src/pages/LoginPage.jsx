import React from 'react'

const LoginPage = () => {
  const handleGoogleLogin = () => {
    console.log(`${import.meta.env.VITE_API_URL}/auth/google/student`)
    // Redirects to backend which handles Google OAuth
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/student`
  }

  return (
    // Updated bg-bg to a deep slate-950
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4">
      {/* Updated card styling: slate-900 surface with a subtle indigo glow */}
      <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-10 w-full max-w-md flex flex-col items-center gap-8 shadow-2xl shadow-indigo-500/5">

        {/* Logo */}
        <div className="flex items-center gap-2">
          {/* Changed accent color to Electric Indigo */}
          <span className="text-[#6366f1] font-mono text-3xl font-bold tracking-tighter">Uchiha</span>
          <span className="text-[#f8fafc] font-mono text-3xl font-bold tracking-tighter">Monitor</span>
        </div>

        <div className="text-center space-y-2">
          <p className="text-[#94a3b8] text-sm leading-relaxed">
            A lightweight API testing tool.<br />Sign in to save your collections.
          </p>
        </div>

        {/* Google Login Button */}
        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#1e293b] hover:bg-[#2d3a4f] border border-[#334155] rounded-xl py-3.5 px-4 text-[#f8fafc] text-sm font-mono transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
        >
          {/* Google SVG icon remains standard */}
          <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Continue with Google
        </button>

        <div className="pt-2">
          <p className="text-[#475569] text-xs font-medium tracking-wide">
            Your data is private and tied to your account.
          </p>
        </div>
      </div>

      {/* Background Decorative Glow (Matches Landing Page) */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none -z-10 opacity-30">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/20 blur-[120px] rounded-full" />
      </div>
    </div>
  )
}

export default LoginPage