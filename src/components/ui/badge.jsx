import * as React from "react"
import { X } from "lucide-react"
import { cn } from "../../lib/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  const variants = {
    default: "border-transparent bg-indigo-600 text-white",
    secondary: "border-transparent bg-gray-100 text-gray-900",
    destructive: "border-transparent bg-red-600 text-white",
    outline: "text-gray-700",
  }
  
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2",
        variants[variant],
        className
      )}
      {...props}
    />
  )
})

Badge.displayName = "Badge"

const TagInput = React.forwardRef(({ 
  className, 
  value = [], 
  onChange, 
  placeholder = "Add tags...",
  ...props 
}, ref) => {
  const [inputValue, setInputValue] = React.useState("")
  
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const newTag = inputValue.trim()
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag])
        setInputValue("")
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }
  
  const removeTag = (tagToRemove) => {
    onChange(value.filter(tag => tag !== tagToRemove))
  }
  
  return (
    <div className={cn(
      "flex min-h-[40px] w-full flex-wrap items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2",
      className
    )}>
      {value.map((tag, index) => (
        <Badge key={index} variant="secondary" className="gap-1">
          {tag}
          <button
            type="button"
            onClick={() => removeTag(tag)}
            className="ml-1 ring-offset-white transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      <input
        ref={ref}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 border-0 bg-transparent outline-none placeholder:text-gray-500"
        {...props}
      />
    </div>
  )
})

TagInput.displayName = "TagInput"

export { Badge, TagInput }
