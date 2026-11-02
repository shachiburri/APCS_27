/*
 *	Author: David Neder
 *  Date: 10/28/26
*/

package pkg;
import java.util.*;

public class BankAccount {
	// -------GLOBAL VARIABLES-------
	private String owner;
    private int accountNumber;
    private double balance;
    private boolean isActive;
    private static int nextAccountNumber = (int) (Math.random() * 950) + 50;

	// -------CONSTRUCTORS-------
	public BankAccount() {
        this.owner = "unknown";
        this.accountNumber = nextAccountNumber;
        this.balance = 0;
        this.isActive = true;
        nextAccountNumber++;
    }

    public BankAccount(String owner) {
        this.owner = owner;
        this.accountNumber = nextAccountNumber;
        this.balance = 0;
        this.isActive = true;
        nextAccountNumber++;
    }

    public BankAccount(String owner, double balance) {
        this.owner = owner;
        this.accountNumber = nextAccountNumber;
        this.balance = balance;
        this.isActive = true;
        nextAccountNumber++;
    }

	// -------METHODS-------
	public void displayAccountInfo() {
        System.out.println("\n--- Account Info ---");
        System.out.println("Owner: " + owner);
        System.out.println("Account Number: " + accountNumber);
        System.out.println("Balance: $" + balance);
        if (isActive) {
            System.out.println("Status: Active");
        } else {
            System.out.println("Status: Closed");
        }
    }

    public void closeAccount() {
        this.isActive = false;
        System.out.println("Account closed for " + owner);
    }

    public boolean isActive() {
        return isActive;
    }

    public String getOwner() {
        return owner;
    }

    public void setOwner(String owner) {
        this.owner = owner;
    }

    public double getBalance() {
        return balance;
    }

    public void checkBalance() {
        System.out.println("Current Account Balance: $" + balance);
    }

    public void deposit(double amount) {
        if (!isActive) {
            System.out.println("Account is closed. Cannot deposit.");
            return;
        }

        if (amount > 0) {
            this.balance += amount;
            System.out.println("Deposited $" + amount);
        }
    }

    public void withdraw(double amount) {
        if (!isActive) {
            System.out.println("Account is closed. Cannot withdraw.");
            return;
        }

        if (amount > balance) {
            System.out.println("Insufficient funds!");
            return;
        }

        this.balance -= amount;
        System.out.println("Withdrew $" + amount);
    }
}