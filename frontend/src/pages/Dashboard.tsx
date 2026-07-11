import {useAuth} from "@/context/AuthContext.tsx";
import PageContainer from "@/components/PageContainer.tsx";
import {useEffect, useState} from "react";
import type {AccountResponse, LoanResponse, TransactionResponse} from "@/types";
import api from "@/api/axios.ts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table.tsx";
import {Button} from "@/components/ui/button.tsx";
import {useNavigate} from "react-router-dom";

export default function Dashboard() {
    const { user } = useAuth()
    const [ accounts, setAccounts ] = useState<AccountResponse[]>([])
    const [ loans, setLoans ] = useState<LoanResponse[]>([])
    const [ recentTransactions, setRecentTransactions ] = useState<TransactionResponse[]>([])
    const [ loading, setLoading ] = useState(true)
    const navigate = useNavigate()

    async function fetchDashboard() {
        try {
            const [accountsRes, loansRes, txRes] = await Promise.all([
                api.get<AccountResponse[]>('/accounts'),
                api.get<LoanResponse[]>('/loans'),
                api.get<TransactionResponse[]>('/transactions/recent'),
            ])
            setAccounts(accountsRes.data)
            setLoans(loansRes.data)
            setRecentTransactions(txRes.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboard()
    }, []);

    const totalBalance = accounts
        .filter(a => a.status === 'ACTIVE')
        .reduce((sum, a) => sum + a.balance, 0)
    const activeLoans = loans.filter(l => l.status === 'ACTIVE')
    const totalOwed = activeLoans.reduce((sum, l) => sum + l.remainingBalance, 0)

    return (
        <PageContainer>
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <p className="mb-4">Welcome, {user?.email}</p>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground">Total balance</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{totalBalance.toFixed(2)}€</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground">Active loans</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{activeLoans.length}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm text-muted-foreground">Total owed</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-2xl font-bold">{totalOwed.toFixed(2)}€</p>
                            </CardContent>
                        </Card>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Recent activity</h2>
                        {recentTransactions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No recent activity.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead className="text-right">Amount</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentTransactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-medium">{tx.type}</TableCell>
                                            <TableCell>{tx.description || '—'}</TableCell>
                                            <TableCell className="text-right">{tx.amount.toFixed(2)}€</TableCell>
                                            <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Quick actions</h2>
                        <div className="flex gap-3">
                            <Button onClick={() => navigate('/transactions')}>Make a transaction</Button>
                            <Button variant="outline" onClick={() => navigate('/accounts')}>Accounts</Button>
                            <Button variant="outline" onClick={() => navigate('/loans')}>Loans</Button>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold mb-3">Your accounts</h2>
                        {accounts.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No accounts yet.</p>
                        ) : (
                            <div className="grid gap-2">
                                {accounts.map((account) => (
                                    <Card key={account.id}>
                                        <CardContent className="flex justify-between items-center py-3">
                                            <div>
                                                <p className="font-medium">{account.nickname}</p>
                                                <p className="text-sm text-muted-foreground">{account.type} · {account.status}</p>
                                            </div>
                                            <p className="font-bold">{account.balance.toFixed(2)}€</p>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </PageContainer>
    )
}