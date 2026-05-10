export function SignInPrompt({ title = "Sign in to continue" }: { title?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4">
      <p className="text-[#9CA3AF] text-sm font-medium max-w-sm">{title}</p>
      <p className="text-[#6B7280] text-xs mt-2">
        Use Sign in in the sidebar when you are ready.
      </p>
    </div>
  );
}
