import {useEffect, useState} from "react";
import type {AccountResponse, Page, TransactionResponse} from "@/types";
import api from "@/api/axios.ts";
import {useNavigate, useParams} from "react-router-dom";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";
import {Button} from "@/components/ui/button.tsx";
import PageContainer from "@/components/PageContainer.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import MoneyAmount, {formatCurrency, isInbound, transTypeLabels} from "@/components/MoneyAmount.tsx";
import {toast} from "sonner";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Copy, Landmark, Plus, Wallet} from "lucide-react";
import ArcCard from "@/components/ArcCard.tsx";

export default function AccountDetailsPage() {
    const [ account, setAccount ] = useState<AccountResponse | null>(null)
    const [ loading, setLoading ] = useState(true)
    const [ submitting, setSubmitting ] = useState(false)
    const [ transactions, setTransactions ] = useState<TransactionResponse[]>([])
    const [ page, setPage ] = useState(0)
    const [ totalPages, setTotalPages ] = useState(0)
    const [ depositOpen, setDepositOpen ] = useState(false)
    const [ depositAmount, setDepositAmount ] = useState('')
    const [ depositDescription, setDepositDescription ] = useState('')
    const [ withdrawOpen, setWithdrawOpen ] = useState(false)
    const [ withdrawAmount, setWithdrawAmount ] = useState('')
    const [ withdrawDescription, setWithdrawDescription ] = useState('')
    const [ myAccounts, setMyAccounts ] = useState<AccountResponse[]>([])
    const [ transferOpen, setTransferOpen ] = useState(false)
    const [ transferToAccountNumber, setTransferToAccountNumber ] = useState('')
    const [ transferAmount, setTransferAmount ] = useState('')
    const [ transferDescription, setTransferDescription ] = useState('')
    const { id } = useParams()
    const navigate = useNavigate()

    async function fetchAccount() {
        try {
            const response = await api.get<AccountResponse | null>(`/accounts/${id}`)
            setAccount(response.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function fetchTransactions() {
        try {
            const response = await api.get<Page<TransactionResponse>>(`/transactions/account/${id}?page=${page}&size=10`)
            setTransactions(response.data.content)
            setTotalPages(response.data.totalPages)
        } catch (err) {
            console.error(err)
        }
    }

    async function fetchAccounts() {
        try {
            const response = await api.get<AccountResponse[]>('/accounts')
            setMyAccounts(response.data)
        } catch (err) {
            console.error(err)
        }
    }

    async function handleCloseAccount() {
        setSubmitting(true)
        try {
            await api.delete(`/accounts/${id}`)
            navigate('/accounts')
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDeposit() {
        if (Number(depositAmount) <= 0) {
            toast.error('Amount must be greater than zero')
            return
        }
        setSubmitting(true)
        try {
            const body = {
                accountId: Number(account?.id),
                amount: Number(depositAmount),
                description: depositDescription
            }
            await api.post<TransactionResponse>('/transactions/deposit', body)
            setDepositAmount('')
            setDepositDescription('')
            await fetchAccount()
            await fetchTransactions()
            toast.success('Deposit successful')
        } catch (err) {
            toast.error('Deposit failed')
        } finally {
            setSubmitting(false)
            setDepositOpen(false)
        }
    }

    async function handleWithdraw() {
        if (Number(withdrawAmount) <= 0) {
            toast.error('Amount must be greater than zero')
            return
        }
        setSubmitting(true)
        try {
            const body = {
                accountId: Number(account?.id),
                amount: Number(withdrawAmount),
                description: withdrawDescription
            }
            await api.post<TransactionResponse>('/transactions/withdraw', body)
            setWithdrawAmount('')
            setWithdrawDescription('')
            await fetchAccount()
            await fetchTransactions()
            toast.success('Withdrawal successful')
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Withdrawal failed')
        } finally {
            setSubmitting(false)
            setWithdrawOpen(false)
        }
    }

    async function handleTransfer() {
        if (Number(transferAmount) <= 0) {
            toast.error('Amount must be greater than zero')
            return
        }
        setSubmitting(true)
        try {
            const body = {
                fromAccountId: Number(account?.id),
                toAccountNumber: transferToAccountNumber,
                amount: Number(transferAmount),
                description: transferDescription
            }
            await api.post<TransactionResponse>('/transactions/transfer', body)
            setTransferToAccountNumber('')
            setTransferAmount('')
            setTransferDescription('')
            await fetchAccounts()
            await fetchAccount()
            await fetchTransactions()
            toast.success('Transfer successful')
        } catch (err: any) {
            toast.error(err.response?.data?.message ?? 'Transfer failed')
        } finally {
            setSubmitting(false)
            setTransferOpen(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
    }, []);

    useEffect(() => {
        fetchAccount()
    }, [id])

    useEffect(() => {
        fetchTransactions()
    }, [id, page])

    const typeLabel = account?.type === 'CHECKING' ? 'Checking' : 'Savings'
    const statusLabel = account ? account.status.charAt(0) + account.status.slice(1).toLowerCase() : ''
    const secondary = account?.type === 'CHECKING' ? 'text-[#C7D2FE]' : 'text-[#A1A1AA]'
    const Icon = account?.type === 'CHECKING' ? Wallet : Landmark

    return (
        <PageContainer>
            {loading ? (
                <p>Loading...</p>
            ) : !account ? (
                <p className="text-muted-foreground">Account not found.</p>
            ) : (
                <>
                    <ArcCard
                        variant={account.type === 'CHECKING' ? 'indigo' : 'zinc'}
                        arcs="md"
                        className="h-[160px] mb-5"
                    >
                        <div className="p-[22px] h-full flex flex-col justify-between">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="text-white text-xl font-semibold">
                                        {account.nickname ?? typeLabel}
                                    </div>
                                    <div className={`text-base mt-0.5 ${secondary}`}>{typeLabel} · {statusLabel}</div>
                                </div>
                                <Icon size={21} className={secondary} />
                            </div>
                            <div className="flex justify-between items-end">
                                <div className={`flex items-center gap-1.5 ${secondary}`}>
                                    <span className="text-[15px] tabular-nums">{account.accountNumber}</span>
                                    <button
                                        aria-label="Copy account number"
                                        className="cursor-pointer transition hover:text-white active:scale-90"
                                        onClick={() => {
                                            navigator.clipboard.writeText(account.accountNumber)
                                            toast.success('Account number copied')
                                        }}
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                                <div className="text-white text-4xl font-semibold tabular-nums">
                                    {formatCurrency(account.balance)}
                                </div>
                            </div>
                        </div>
                    </ArcCard>

                    <div className="flex gap-2 items-center mb-6">
                        <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus size={16} /> Deposit
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Deposit money to this account</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="deposit-amount">Amount (€)</Label>
                                        <Input
                                            type="number"
                                            id="deposit-amount"
                                            placeholder="0.0€"
                                            value={depositAmount}
                                            onChange={(e) => setDepositAmount(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deposit-description">Description (optional)</Label>
                                        <Input
                                            id="deposit-description"
                                            placeholder="e.g. Birthday gift"
                                            value={depositDescription}
                                            onChange={(e) => setDepositDescription(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button onClick={handleDeposit} disabled={submitting}>
                                        {submitting ? 'Loading...' : 'Make deposit'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Withdraw</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Withdraw money from this account</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="withdraw-amount">Amount (€)</Label>
                                        <Input
                                            type="number"
                                            id="withdraw-amount"
                                            placeholder="0.0€"
                                            value={withdrawAmount}
                                            onChange={(e) => setWithdrawAmount(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="withdraw-description">Description (optional)</Label>
                                        <Input
                                            id="withdraw-description"
                                            placeholder="e.g. Birthday gift"
                                            value={withdrawDescription}
                                            onChange={(e) => setWithdrawDescription(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button onClick={handleWithdraw} disabled={submitting}>
                                        {submitting ? 'Loading...' : 'Make withdrawal'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline">Transfer</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Make a transfer to a different account</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-4 py-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="to-account">To-account number</Label>
                                        <Input
                                            id="to-account"
                                            placeholder="UNI..."
                                            value={transferToAccountNumber}
                                            onChange={(e) => setTransferToAccountNumber(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-xs text-muted-foreground">Yours:</span>
                                        {myAccounts
                                            .filter((a) => a.id !== account.id && a.status === 'ACTIVE')
                                            .map((a) => (
                                                <button
                                                    key={a.id}
                                                    type="button"
                                                    onClick={() => setTransferToAccountNumber(a.accountNumber)}
                                                    className="text-xs px-2 py-1 rounded-full border border-border hover:bg-accent transition"
                                                >
                                                    {a.nickname ?? a.type}
                                                </button>
                                            ))}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="transfer-amount">Amount (€)</Label>
                                        <Input
                                            type="number"
                                            id="transfer-amount"
                                            placeholder="0.0€"
                                            value={transferAmount}
                                            onChange={(e) => setTransferAmount(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="transfer-description">Description (optional)</Label>
                                        <Input
                                            id="transfer-description"
                                            placeholder="e.g. Ticket money"
                                            value={transferDescription}
                                            onChange={(e) => setTransferDescription(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button onClick={handleTransfer} disabled={submitting}>
                                        {submitting ? 'Loading...' : 'Make transfer'}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 ml-auto">
                                    Close
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Close this account?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will permanently close "{account.nickname}". This action cannot be undone.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleCloseAccount} disabled={submitting}>
                                        {submitting ? 'Closing...' : 'Close account'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    <div className="max-w-lg mt-6">
                        <h2 className="text-lg font-semibold mb-3">Transaction history</h2>
                        {transactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No transactions yet.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-medium">{tx.type}</TableCell>
                                            <TableCell>{tx.description || transTypeLabels[tx.type]}</TableCell>
                                            <TableCell className="text-right">
                                                <MoneyAmount amount={tx.amount} direction={isInbound(tx.type) ? 'in' : 'out'} />
                                            </TableCell>
                                            <TableCell className="text-right">{formatCurrency(tx.balanceAfter)}</TableCell>
                                            <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 0}
                                >
                                    Previous
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                     Page {page + 1} of {totalPages}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(page + 1)}
                                    disabled={page >= totalPages - 1}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </PageContainer>
    )
}