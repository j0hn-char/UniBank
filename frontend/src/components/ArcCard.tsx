import React from "react";

type ArcCardProps = {
    variant?: 'indigo' | 'zinc'
    arcs?: 'sm' | 'md' | 'lg'
} & React.ComponentProps<'div'>

const variantClasses = {
    indigo: {
        bg: 'bg-[#4338CA]',
        circle1: 'bg-[#3B31B5]',
        circle2: 'bg-[#372DA8]',
    },
    zinc: {
        bg: 'bg-[#27272A]',
        circle1: 'bg-[#323232]',
        circle2: 'bg-[#2E2E2E]',
    },
}

const arcClasses = {
    sm: {
        circle1: 'w-[190px] h-[190px] -top-[115px] -right-[60px]',
        circle2: 'w-[130px] h-[130px] -bottom-[80px] -left-[40px]',
    },
    md: {
        circle1: 'w-[230px] h-[230px] -top-[140px] -right-[70px]',
        circle2: 'w-[160px] h-[160px] -bottom-[100px] -left-[50px]',
    },
    lg: {
        circle1: 'w-[280px] h-[280px] -top-[140px] -right-[120px]',
        circle2: 'w-[200px] h-[200px] -bottom-[110px] -left-[70px]',
    },
}

export default function ArcCard({ variant = 'indigo', arcs = 'sm', className, children, ...props }: ArcCardProps) {
    return (
        <div className={`relative overflow-hidden rounded-[20px] ${variantClasses[variant].bg} ${className}`} {...props}>
            <div className={`absolute rounded-full ${variantClasses[variant].circle1} ${arcClasses[arcs].circle1}`} />
            <div className={`absolute rounded-full ${variantClasses[variant].circle2} ${arcClasses[arcs].circle2}`} />
            <div className="relative h-full">{children}</div>
        </div>
    )
}