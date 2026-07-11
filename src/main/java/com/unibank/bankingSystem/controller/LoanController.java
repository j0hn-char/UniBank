package com.unibank.bankingSystem.controller;

import com.unibank.bankingSystem.dto.LoanRepaymentRequest;
import com.unibank.bankingSystem.dto.LoanRequest;
import com.unibank.bankingSystem.dto.LoanResponse;
import com.unibank.bankingSystem.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
public class LoanController {

    private final LoanService loanService;

    @PostMapping
    public LoanResponse applyForLoan(@RequestBody LoanRequest request) {
        return loanService.applyForLoan(request);
    }

    @PutMapping("/{id}/approve")
    public LoanResponse approveLoan(@PathVariable Long id) {
        return loanService.approveLoan(id);
    }

    @PutMapping("/{id}/reject")
    public LoanResponse rejectLoan(@PathVariable Long id) {
        return loanService.rejectLoan(id);
    }

    @PostMapping("/{id}/repay")
    public LoanResponse repayLoan(@PathVariable Long id, @RequestBody LoanRepaymentRequest request) {
        return loanService.repayLoan(id, request);
    }

    @GetMapping("/pending")
    public List<LoanResponse> getPendingLoans() {
        return loanService.getPendingLoans();
    }

    @GetMapping
    public List<LoanResponse> getUserLoans() {
        return loanService.getUserLoans();
    }
}