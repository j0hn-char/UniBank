import {useEffect, useState} from "react";
import type {LoanResponse} from "@/types";
import api from "@/api/axios.ts";
import PageContainer from "@/components/PageContainer.tsx";
import {Button} from "@/components/ui/button.tsx";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.tsx";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog.tsx";

export default function AdminLoansPage() {
    const [ loans, setLoans ] = useState<LoanResponse[]>([])
    const [ loading, setLoading ] = useState(true)
    const [ submitting, setSubmitting ] = useState(false)

    async function fetchPendingLoans() {
        try {
            const response = await api.get<LoanResponse[]>('/loans/pending')
            setLoans(response.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    async function handleApprove(id: number) {
        setSubmitting(true)
        try {
            await api.put(`/loans/${id}/approve`)
            fetchPendingLoans()
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    async function handleReject(id: number) {
        setSubmitting(true)
        try {
            await api.put(`/loans/${id}/reject`)
            fetchPendingLoans()
        } catch (err) {
            console.error(err)
        } finally {
            setSubmitting(false)
        }
    }

    useEffect(() => {
        fetchPendingLoans()
    }, []);

    return (
        <PageContainer>
            <h1 className="text-2xl font-bold mb-6">Pending Loans</h1>
            {loading ? (
                <p>Loading...</p>
            ) : loans.length === 0 ? (
                <p className="text-muted-foreground">There are no pending loans.</p>
            ) : (
                <div className="grid gap-4">
                    {loans.map((loan) => (
                        <Card key={loan.id} className="max-w-lg">
                            <CardHeader>
                                <CardTitle>{loan.purpose}</CardTitle>
                                <p className="text-sm text-muted-foreground">{loan.status}</p>
                            </CardHeader>
                            <CardContent className="space-y-1 text-sm">
                                <p>Principal: {loan.principalAmount.toFixed(2)}€</p>
                                <p>Remaining: {loan.remainingBalance.toFixed(2)}€</p>
                                <p>Monthly payment: {loan.monthlyPayment.toFixed(2)}€</p>
                                <p>Term: {loan.termMonths} months</p>
                                <p>Interest rate: {loan.interestRate}%</p>
                                <div className="flex gap-2 mt-4">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button disabled={submitting}>Approve</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Approve this loan?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will disburse {loan.principalAmount.toFixed(2)} € to the borrower's account. This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => handleApprove(loan.id)}>Approve</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" disabled={submitting}>Reject</Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Reject this loan?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    This will reject the loan application. This cannot be undone.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction variant="destructive" onClick={() => handleReject(loan.id)}>Reject</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </PageContainer>
    )

}