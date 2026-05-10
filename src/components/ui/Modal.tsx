import * as React from "react"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Modal({ isOpen, onClose, title, children, className, ...props }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-fast">
      <div 
        className={cn(
          "w-full max-w-lg rounded-xl border border-navy-border bg-navy-surface p-5 shadow-2xl",
          className
        )}
        {...props}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
          <button 
            onClick={onClose}
            className="rounded-md p-1 text-text-muted hover:bg-navy-border hover:text-text-primary transition-fast focus:outline-none focus:ring-2 focus:ring-teal-primary focus:ring-offset-2 focus:ring-offset-navy-surface"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  )
}
