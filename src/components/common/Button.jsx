import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  // Variant styles - Clean white theme
  const variantClasses = {
    primary: `
      bg-blue-600 text-white font-medium
      hover:bg-blue-700
      disabled:bg-neutral-300 disabled:text-neutral-500
      shadow-sm hover:shadow-md
    `,
    secondary: `
      bg-white border border-neutral-200
      text-neutral-700 font-medium
      hover:bg-neutral-50 hover:border-neutral-300
      disabled:bg-neutral-100 disabled:text-neutral-400
    `,
    ghost: `
      bg-transparent
      text-neutral-600 font-medium
      hover:bg-neutral-100 hover:text-neutral-900
      disabled:text-neutral-300
    `,
    outline: `
      bg-transparent border-2 border-blue-600
      text-blue-600 font-medium
      hover:bg-blue-50
      disabled:border-neutral-300 disabled:text-neutral-400
    `,
    danger: `
      bg-red-500 text-white font-medium
      hover:bg-red-600
      disabled:bg-neutral-300 disabled:text-neutral-500
    `,
  };

  // Size styles
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
    md: 'px-5 py-2.5 text-base rounded-xl gap-2',
    lg: 'px-8 py-3.5 text-lg rounded-xl gap-3',
    xl: 'px-10 py-4 text-xl rounded-2xl gap-3',
  };

  // Icon sizes
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-7 h-7',
  };

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      type={type}
      variants={buttonVariants}
      initial="idle"
      whileHover={!isDisabled ? 'hover' : undefined}
      whileTap={!isDisabled ? 'tap' : undefined}
      disabled={isDisabled}
      onClick={onClick}
      className={`
        relative inline-flex items-center justify-center
        transition-all duration-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
        ${className}
      `}
      {...props}
    >
      {/* Loading spinner */}
      {isLoading && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Loader2 className={`${iconSizes[size]} animate-spin`} />
        </motion.span>
      )}

      {/* Content wrapper */}
      <span
        className={`
          inline-flex items-center ${sizeClasses[size].split(' ').find(c => c.startsWith('gap'))}
          ${isLoading ? 'invisible' : 'visible'}
        `}
      >
        {/* Left icon */}
        {Icon && iconPosition === 'left' && (
          <Icon className={iconSizes[size]} />
        )}

        {/* Button text */}
        <span>{children}</span>

        {/* Right icon */}
        {Icon && iconPosition === 'right' && (
          <Icon className={iconSizes[size]} />
        )}
      </span>
    </motion.button>
  );
}

// Icon-only button variant
export function IconButton({
  icon: Icon,
  size = 'md',
  variant = 'ghost',
  label,
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const variantClasses = {
    ghost: 'hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900',
    secondary: 'bg-neutral-100 hover:bg-neutral-200 text-neutral-700',
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  };

  return (
    <motion.button
      variants={buttonVariants}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      className={`
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        rounded-xl flex items-center justify-center
        transition-colors duration-200
        ${className}
      `}
      aria-label={label}
      {...props}
    >
      <Icon className={iconSizes[size]} />
    </motion.button>
  );
}

export default Button;
