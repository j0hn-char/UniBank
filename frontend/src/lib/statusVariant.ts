type BadgeVariant = 'success' | 'warning' | 'destructive' | 'secondary'

const statusVariants: Record<string, BadgeVariant> = {
    ACTIVE: 'success',
    APPROVED: 'success',
    PAID_OFF: 'success',
    PENDING: 'warning',
    FROZEN: 'warning',
    REJECTED: 'destructive',
    CLOSED: 'secondary',
}

export function statusVariant(status: string): BadgeVariant {
    return statusVariants[status] ?? 'secondary'
}