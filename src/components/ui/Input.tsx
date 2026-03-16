import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onDrag'> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = ({ 
  label, 
  error, 
  icon,
  className, 
  ...props 
}: InputProps) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-2.5 text-gray-400">
            {icon}
          </div>
        )}
        <motion.input
          className={cn(
            'w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200',
            icon && 'pl-10',
            error && 'border-red-300 focus:ring-red-500',
            className
          )}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.15 }}
          {...(props as any)}
        />
      </div>
      {error && (
        <motion.p 
          className="text-sm text-red-600"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
