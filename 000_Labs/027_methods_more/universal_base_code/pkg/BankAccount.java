/*
 *	Author: David Neder
 *  Date: 10/22/26
*/

package pkg;
import java.util.*;

public class BankAccount {
	// -------GLOBAL VARIABLES-------
	private String owner;
	private int accountNumber;
	private double balance;
	private boolean isActive;
	private static int nextAccountNumber = (int) (Math.random() * 950.0) + 50;

	// -------CONSTRUCTORS-------
	public BankAccount() {
    	this.owner = "unknown";
    	this.accountNumber = nextAccountNumber;
    	this.balance = 0.0;
    	this.isActive = true;
    	nextAccountNumber++;
	}
	public BankAccount(String name) {
    	this.owner = name;
    	this.accountNumber = nextAccountNumber;
    	this.balance = 0.0;
    	this.isActive = true;
    	nextAccountNumber++;
	}
	public BankAccount(String name, double deposit) {
    	this.owner = name;
    	this.accountNumber = nextAccountNumber;
    	this.balance = deposit;
    	this.isActive = true;
    	nextAccountNumber++;
	}

	// -------METHODS-------
	public void displayAccountInfo() {
    	System.out.println("\n--- Account Info ---");
    	System.out.println("Owner: " + this.owner);
    	System.out.println("Account Number: " + this.accountNumber);
    	System.out.println("Balance: $" + this.balance);
    	if (this.isActive) {
    		System.out.println("Status: Active");
    	} else {
    		System.out.println("Status: Closed");
    	}
	}

	public void checkBalance() {
		System.out.println("Current Account Balance: $" + this.balance);
	}
}