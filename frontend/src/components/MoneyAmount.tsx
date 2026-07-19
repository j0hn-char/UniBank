import type {TransType} from "@/types";

type MoneyAmountProps = {
    amount: number
    direction: 'in' | 'out'
}

export default function MoneyAmount({ amount, direction }: MoneyAmountProps) {
    return <span className={`${direction === 'in' ? 'text-success' : 'text-destructive'} tabular-nums font-semibold`}>
        {(direction === 'in' ? '+' : '−') + formatCurrency(amount)}
    </span>
}

const inboundTypes: TransType[] = ['DEPOSIT', 'TRANSFER_IN', 'LOAN_DISBURSEMENT']

export function isInbound(type: TransType) {
    return inboundTypes.includes(type)
}

export function formatCurrency(amount: number) {
    return new Intl.NumberFormat('el-GR', { style: 'currency', currency: 'EUR' }).format(amount)
}