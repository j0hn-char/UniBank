import {useEffect, useState} from "react";
import api from "@/api/axios.ts";
import type {AccountResponse, TransactionResponse} from "@/types";
import PageContainer from "@/components/PageContainer.tsx";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs.tsx";
import {Label} from "@/components/ui/label.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";
import {Button} from "@/components/ui/button.tsx";

export default function TransactionsPage() {
    const [ accounts, setAccounts ] = useState<AccountResponse[]>([])
    const [ loading, setLoading ] = useState(true)
    const [ depositAccountId, setDepositAccountId ] = useState('')
    const [ depositAmount, setDepositAmount ] = useState('')
    const [ depositDescription, setDepositDescription ] = useState('')
    const [depositError, setDepositError] = useState('')
    const [ withdrawAccountId, setWithdrawAccountId ] = useState('')
    const [ withdrawAmount, setWithdrawAmount ] = useState('')
    const [ withdrawDescription, setWithdrawDescription ] = useState('')
    const [ withdrawError, setWithdrawError ] = useState('')
    const [ submitting, setSubmitting ] = useState(false)
    const [ transferFromId, setTransferFromId ] = useState('')
    const [ transferToNumber, setTransferToNumber ] = useState('')
    const [ transferAmount, setTransferAmount ] = useState('')
    const [ transferDescription, setTransferDescription ] = useState('')
    const [ transferError, setTransferError ] = useState('')

    async function fetchAccounts() {
        try {
            const response = await api.get<AccountResponse[]>('/accounts')
            setAccounts(response.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleDeposit() {
        if (Number(depositAmount) <= 0) {
            setDepositError('Amount must be greater than zero')
            return
        }
        setSubmitting(true)
        setDepositError('')
        try {
            const body = {
                accountId: Number(depositAccountId),
                amount: Number(depositAmount),
                description: depositDescription
            }
            await api.post<TransactionResponse>('/transactions/deposit', body)
            setDepositAccountId('')
            setDepositAmount('')
            setDepositDescription('')
            await fetchAccounts()
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    async function handleWithdraw() {
        if (Number(withdrawAmount) <= 0) {
            setWithdrawError('Amount must be greater than zero')
            return
        }
        setSubmitting(true)
        setWithdrawError('')
        try {
            const body = {
                accountId: Number(withdrawAccountId),
                amount: Number(withdrawAmount),
                description: withdrawDescription
            }
            await api.post<TransactionResponse>('/transactions/withdraw', body)
            setWithdrawAccountId('')
            setWithdrawAmount('')
            setWithdrawDescription('')
            await fetchAccounts()
        } catch (err: any) {
            setWithdrawError(err.response?.data?.message ?? 'Withdrawal failed')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleTransfer() {
        if (Number(transferAmount) <= 0) {
            setTransferError('Amount must be greater than zero')
            return
        }
        setSubmitting(true)
        setTransferError('')
        try {
            const body = {
                fromAccountId: Number(transferFromId),
                toAccountNumber: transferToNumber,
                amount: Number(transferAmount),
                description: transferDescription
            }
            await api.post<TransactionResponse>('/transactions/transfer', body)
            setTransferFromId('')
            setTransferToNumber('')
            setTransferAmount('')
            setTransferDescription('')
            await fetchAccounts()
        } catch (err: any) {
            setTransferError(err.response?.data?.message ?? 'Transfer failed')
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    const activeAccounts = accounts.filter((a) => a.status === 'ACTIVE')

    return (
        <PageContainer>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <Tabs defaultValue="deposit" className="max-w-md">
                    <TabsList>
                        <TabsTrigger value="deposit">Deposit</TabsTrigger>
                        <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                        <TabsTrigger value="transfer">Transfer</TabsTrigger>
                    </TabsList>

                    <TabsContent value="deposit" className="space-y-4">
                        <div className="space-y-2">
                            <Label>Account</Label>
                            <Select value={depositAccountId} onValueChange={setDepositAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeAccounts.map((account) => (
                                        <SelectItem key={account.id} value={String(account.id)}>
                                            {account.nickname} — {account.balance.toFixed(2)}€
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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

                        {depositError && <p className="text-sm text-red-500">{depositError}</p>}

                        <Button onClick={handleDeposit} disabled={submitting}>
                            {submitting ? 'Depositing...' : 'Make deposit'}
                        </Button>
                    </TabsContent>

                    <TabsContent value="withdraw" className="space-y-4">
                        <div className="space-y-2">
                            <Label>Account</Label>
                            <Select value={withdrawAccountId} onValueChange={setWithdrawAccountId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeAccounts.map((account) => (
                                        <SelectItem key={account.id} value={String(account.id)}>
                                            {account.nickname} — {account.balance.toFixed(2)}€
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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

                        {withdrawError && <p className="text-sm text-red-500">{withdrawError}</p>}

                        <Button onClick={handleWithdraw} disabled={submitting}>
                            {submitting ? 'Withdrawing...' : 'Make withdrawal'}
                        </Button>
                    </TabsContent>
                    <TabsContent value="transfer" className="space-y-4">
                        <div className="space-y-2">
                            <Label>From account</Label>
                            <Select value={transferFromId} onValueChange={setTransferFromId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an account" />
                                </SelectTrigger>
                                <SelectContent>
                                    {activeAccounts.map((account) => (
                                        <SelectItem key={account.id} value={String(account.id)}>
                                            {account.nickname} — {account.balance.toFixed(2)}€
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="to-account">To-account number</Label>
                            <Input
                                id="to-account"
                                placeholder="UNI..."
                                value={transferToNumber}
                                onChange={(e) => setTransferToNumber(e.target.value)}
                            />
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

                        {transferError && <p className="text-sm text-red-500">{transferError}</p>}

                        <Button onClick={handleTransfer} disabled={submitting}>
                            {submitting ? 'Transferring...' : 'Make transfer'}
                        </Button>
                    </TabsContent>
                </Tabs>
            )}
        </PageContainer>
    )
}