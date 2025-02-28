export function AuthContainer({ children }: { children: React.ReactNode }) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-orange-400 via-orange-500 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://img.freepik.com/free-photo/abstract-dark-background-with-flowing-colouful-waves_1048-13124.jpg?t=st=1738067648~exp=1738071248~hmac=1662d62fff63944f93db959830ca142d0209ae4a2e2a0ced205ccb17b189a994&w=900')] opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0  backdrop-blur-sm" />
        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
    )
  }
  
  