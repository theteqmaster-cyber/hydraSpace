import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag'> {
  children: React.ReactNode
}

export const Card = ({ className, children, ...props }: CardProps) => {
  return (
    <motion.div
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...(props as any)}
    >
      {children}
    </motion.div>
  )
}

export const CardHeader = ({ className, children, ...props }: CardProps) => {
  return (
    <div
      className={cn('px-6 py-4 border-b border-gray-200 bg-gray-50', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export const CardContent = ({ className, children, ...props }: CardProps) => {
  return (
    <div className={cn('px-6 py-4', className)} {...props}>
      {children}
    </div>
  )
}

export const CardFooter = ({ className, children, ...props }: CardProps) => {
  return (
    <div
      className={cn('px-6 py-4 border-t border-gray-200 bg-gray-50', className)}
      {...props}
    >
      {children}
    </div>
  )
}
