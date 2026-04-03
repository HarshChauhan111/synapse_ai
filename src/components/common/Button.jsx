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
  glow = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  // Variant styles
  const variantClasses = {
    primary: `
      bg-gradient-to-r from-accent-primary to-accent-secondary
      text-white font-medium
      hover:from-accent-secondary hover:to-accent-tertiary
      disabled:from-gray-600 disabled:to-gray-600
    `,
    secondary: `
      bg-white/10 border border-white/20
      text-white font-medium
      hover:bg-white/20 hover:border-white/30
      disabled:bg-white/5 disabled:border-white/10 disabled:text-white/40
    `,
    ghost: `
      bg-transparent
      text-white/80 font-medium
      hover:bg-white/10 hover:text-white
      disabled:text-white/30
    `,
    outline: `
      bg-transparent border-2 border-accent-primary
      text-accent-primary font-medium
      hover:bg-accent-primary/10
      disabled:border-white/20 disabled:text-white/40
    `,
    danger: `
      bg-gradient-to-r from-red-500 to-rose-500
      text-white font-medium
      hover:from-red-600 hover:to-rose-600
      disabled:from-gray-600 disabled:to-gray-600
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
        ${glow && !isDisabled ? 'pulse-glow' : ''}
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

      {/* Glow background (for glow variant) */}
      {glow && !isDisabled && (
        <motion.span
          className="absolute inset-0 rounded-xl bg-accent-primary opacity-0 blur-xl -z-10"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
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
    ghost: 'hover:bg-white/10 text-white/70 hover:text-white',
    secondary: 'bg-white/10 hover:bg-white/20 text-white',
    primary: 'bg-accent-primary hover:bg-accent-secondary text-white',
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
