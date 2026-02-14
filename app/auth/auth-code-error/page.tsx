export default function AuthErrorPage() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-2">
        <h1 className="text-4xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-lg mb-8">Something went wrong during the login process.</p>
        <a href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Try Again
        </a>
      </div>
    )
  }