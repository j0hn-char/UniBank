import {useEffect, useState} from "react";
import api from "@/api/axios.ts";
import type {AccountResponse, AccountType} from "@/types";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Label} from "@/components/ui/label.tsx";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog.tsx";
import {Input} from "@/components/ui/input.tsx";
import {useNavigate} from "react-router-dom";
import PageContainer from "@/components/PageContainer.tsx";
import {formatCurrency} from "@/components/MoneyAmount.tsx";
import {statusVariant} from "@/lib/statusVariant.ts";
import {Badge} from "@/components/ui/badge.tsx";

export default function AccountsPage() {
    const [ accounts, setAccounts ] = useState<AccountResponse[]>([])
    const [ loading, setLoading ] = useState(true)
    const [ type, setType ] = useState<AccountType>('CHECKING')
    const [ nickname, setNickname ] = useState('')
    const [ dialogOpen, setDialogOpen ] = useState(false)
    const [ submitting, setSubmitting ] = useState(false)
    const navigate = useNavigate()

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

    async function handleOpenAccount() {
        setSubmitting(true)
        try {
            await api.post<AccountResponse>('/accounts', { type, nickname })
            setDialogOpen(false)
            setNickname('')
            await fetchAccounts()
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        fetchAccounts()
    }, [])

    const sortedAccounts = [...accounts].sort((a, b) => {
        if (a.status === 'CLOSED' && b.status !== 'CLOSED') return 1
        if (a.status !== 'CLOSED' && b.status === 'CLOSED') return -1
        return 0
    })

    return (
        <PageContainer>
            <h1 className="text-2xl font-bold mb-6">My Accounts</h1>

            <div className="mb-6">
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button>Open account</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Open a new account</DialogTitle>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="space-y-2">
                                <Label>Account type</Label>
                                <Select value={type} onValueChange={(v) => setType(v as AccountType)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CHECKING">Checking</SelectItem>
                                        <SelectItem value="SAVINGS">Savings</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nickname">Nickname (optional)</Label>
                                <Input
                                    id="nickname"
                                    placeholder="e.g. Rent money"
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button onClick={handleOpenAccount} disabled={submitting}>
                                {submitting ? 'Loading...' : 'Open account'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : accounts.length === 0 ? (
                <p className="text-muted-foreground">You don't have any accounts yet.</p>
            ) : (
                <div className="grid gap-4">
                    {sortedAccounts.map((account) => (
                        <Card
                            key={account.id}
                            onClick={() => navigate(`/accounts/${account.id}`)}
                            className={`cursor-pointer hover:shadow-md transition-shadow ${
                                account.status === 'CLOSED' ? 'opacity-50' : ''
                            }`}
                        >
                            <CardHeader>
                                <CardTitle>{account.nickname}</CardTitle>
                                <Badge variant={statusVariant(account.status)}>{account.status}</Badge>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                                <p className="text-2xl font-bold">{formatCurrency(account.balance)}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </PageContainer>
    )
}