import * as React from "react"
import { cn } from "@/lib/utils"

// Simple wrapper that extracts children and builds a select
const Select = ({ value, onValueChange, children, className }) => {
  const triggerProps = React.Children.toArray(children).find(
    child => child.type?.displayName === 'SelectTrigger'
  )?.props;

  const contentChild = React.Children.toArray(children).find(
    child => child.type?.displayName === 'SelectContent'
  );

  const options = contentChild ? React.Children.toArray(contentChild.props.children) : [];

  return (
    <select
      value={value}
      onChange={(e) => onValueChange?.(e.target.value)}
      className={cn(
        "flex h-10 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        triggerProps?.className,
        className
      )}
    >
      {options}
    </select>
  );
};
Select.displayName = "Select"

const SelectTrigger = ({ className, children, ...props }) => null;
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }) => null;
SelectValue.displayName = "SelectValue"

const SelectContent = ({ children }) => null;
SelectContent.displayName = "SelectContent"

const SelectItem = ({ value, children, className, ...props }) => (
  <option value={value} className={className} {...props}>
    {children}
  </option>
)
SelectItem.displayName = "SelectItem"

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem }
