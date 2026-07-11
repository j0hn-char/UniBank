package com.unibank.bankingSystem.service;

import com.unibank.bankingSystem.dto.TransactionRequest;
import com.unibank.bankingSystem.dto.TransactionResponse;
import com.unibank.bankingSystem.dto.TransferRequest;
import com.unibank.bankingSystem.exception.BadRequestException;
import com.unibank.bankingSystem.exception.InsufficientFundsException;
import com.unibank.bankingSystem.exception.ResourceNotFoundException;
import com.unibank.bankingSystem.exception.UnauthorizedException;
import com.unibank.bankingSystem.model.*;
import com.unibank.bankingSystem.repository.AccountRepository;
import com.unibank.bankingSystem.repository.TransactionRepository;
import com.unibank.bankingSystem.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public TransactionResponse deposit(TransactionRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("User not found")
        );

        Account account = accountRepository.findById(request.getAccountId()).orElseThrow(
                () -> new ResourceNotFoundException("Account not found")
        );
        if (!account.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this account");
        }

        account.setBalance(account.getBalance().add(request.getAmount()));

        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setAmount(request.getAmount());
        transaction.setBalanceAfter(account.getBalance());
        transaction.setType(TransType.DEPOSIT);
        transaction.setDescription(request.getDescription());

        accountRepository.save(account);
        transactionRepository.save(transaction);

        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getBalanceAfter(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }

    public TransactionResponse withdraw(TransactionRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("User not found")
        );

        Account account = accountRepository.findById(request.getAccountId()).orElseThrow(
                () -> new ResourceNotFoundException("Account not found")
        );
        if (!account.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this account");
        }

        if(account.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException("Insufficient funds");
        }

        account.setBalance(account.getBalance().subtract(request.getAmount()));

        Transaction transaction = new Transaction();
        transaction.setAccount(account);
        transaction.setAmount(request.getAmount());
        transaction.setBalanceAfter(account.getBalance());
        transaction.setType(TransType.WITHDRAWAL);
        transaction.setDescription(request.getDescription());

        accountRepository.save(account);
        transactionRepository.save(transaction);

        return new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getBalanceAfter(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        );
    }


    @Transactional
    public TransactionResponse transfer(TransferRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("User not found")
        );

        Account fromAccount = accountRepository.findById(request.getFromAccountId()).orElseThrow(
                () -> new ResourceNotFoundException("Account not found")
        );
        if (!fromAccount.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this account");
        }

        if(fromAccount.getBalance().compareTo(request.getAmount()) < 0) {
            throw new InsufficientFundsException("Insufficient funds");
        }

        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber()).orElseThrow(
                () -> new ResourceNotFoundException("Account not found")
        );

        if(fromAccount.getId().equals(toAccount.getId())) {
            throw new BadRequestException("The from-account can not be the same as the to-account");
        }

        if(toAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new BadRequestException("You can not make a transfer to a frozen/closed account");
        }

        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));

        Transaction outTransaction = new Transaction();
        outTransaction.setAccount(fromAccount);
        outTransaction.setAmount(request.getAmount());
        outTransaction.setBalanceAfter(fromAccount.getBalance());
        outTransaction.setType(TransType.TRANSFER_OUT);
        outTransaction.setDescription(request.getDescription());

        Transaction inTransaction = new Transaction();
        inTransaction.setAccount(toAccount);
        inTransaction.setAmount(request.getAmount());
        inTransaction.setBalanceAfter(toAccount.getBalance());
        inTransaction.setType(TransType.TRANSFER_IN);
        inTransaction.setDescription(request.getDescription());

        accountRepository.save(fromAccount);
        transactionRepository.save(outTransaction);

        accountRepository.save(toAccount);
        transactionRepository.save(inTransaction);

        return new TransactionResponse(
                outTransaction.getId(),
                outTransaction.getType(),
                outTransaction.getAmount(),
                outTransaction.getBalanceAfter(),
                outTransaction.getDescription(),
                outTransaction.getCreatedAt()
        );
    }

    public Page<TransactionResponse> getTransactionHistory(Long accountId, Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("User not found")
        );

        Account account = accountRepository.findById(accountId).orElseThrow(
                () -> new ResourceNotFoundException("Account not found")
        );
        if (!account.getOwner().getId().equals(user.getId())) {
            throw new UnauthorizedException("You do not own this account");
        }
        Page<Transaction> transactions = transactionRepository.findByAccountOrderByCreatedAtDesc(account, pageable);

        return transactions.map(transaction -> new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getBalanceAfter(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        ));
    }

    public List<TransactionResponse> getRecentTransactions() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(
                () -> new ResourceNotFoundException("User not found")
        );
        Pageable pageable = PageRequest.of(0,10);
        Page<Transaction> transactions = transactionRepository.findByAccountOwnerOrderByCreatedAtDesc(user, pageable);

        return transactions.map(transaction -> new TransactionResponse(
                transaction.getId(),
                transaction.getType(),
                transaction.getAmount(),
                transaction.getBalanceAfter(),
                transaction.getDescription(),
                transaction.getCreatedAt()
        )).getContent();
    }
}
