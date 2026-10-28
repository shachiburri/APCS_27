/*
 *	Author: David Neder
 *  Date: 10/22/26
*/

import pkg.*;
import java.util.*;

class starter {
    public static void main(String args[]) {
        // Your code goes below here
        Scanner scanner = new Scanner(System.in);

        System.out.println("Welcome to the ATM!");
        System.out.println("We're going to create a bank account! What info do we know?");
        System.out.println("1 - Nothing");
        System.out.println("2 - Owner");
        System.out.println("3 - Owner and Initial Deposit");

        int choice = scanner.nextInt();
        scanner.nextLine();
        System.out.println();

        BankAccount newAccount;

        if (choice == 1) {
            System.out.println("Account successfully created!");
            newAccount = new BankAccount();
            newAccount.displayAccountInfo();
        }
        else if (choice == 2) {
            System.out.println("What is the name of the owner of this bank account?");
            String name = scanner.nextLine();
            newAccount = new BankAccount(name);
            newAccount.displayAccountInfo();
        }
        else if (choice == 3) {
            System.out.println("What is the name of the owner of this bank account?");
            String name = scanner.nextLine();
            System.out.println("How much are you initially depositing into this account?");
            double deposit = scanner.nextDouble();
            scanner.nextLine();
            newAccount = new BankAccount(name, deposit);
            newAccount.displayAccountInfo();
        }
        else {
            System.out.println("Invalid option");
            return;
        }

        System.out.println();
        System.out.println("Would you like to check your balance of this account? (yes/no)");
        String choice2 = scanner.nextLine();

        if (choice2.equalsIgnoreCase("yes")) {
            newAccount.checkBalance();
        }
        else if (choice2.equalsIgnoreCase("no")) {
            System.out.println("Great! No balance checked.");
        }
        else {
            System.out.println("Invalid option");
        }

        System.out.println();
        System.out.println("Thank you for coming to the ATM!");

		scanner.close();
    }
}