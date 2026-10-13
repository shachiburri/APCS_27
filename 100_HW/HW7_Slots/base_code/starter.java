/*
 *	Author: David Neder
 *  Date: 10/9/26
 * 	Collaborator(s): - 
*/

import java.util.Scanner;

class starter {
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);
        int money = 100;
        String play = "yes";

        System.out.println("Welcome to the Slot Machine!");

        while (money > 0) {
            System.out.println("You have $" + money);
            System.out.print("How much do you want to bet? $");
            int bet = scanner.nextInt();

            if (bet <= 0 || bet > money) {
                System.out.println("Invalid bet. Try again.");
                continue;
            }

            int first = (int)(Math.random() * 5) + 1;
            int second = (int)(Math.random() * 5) + 1;
            int third = (int)(Math.random() * 5) + 1;

            System.out.println(first + " | " + second + " | " + third);

            money = money - bet;

            if (first == second && second == third) {
                System.out.println("JACKPOT! You won triple your bet!");
                money = money + (bet * 3);
            }
            else if (first == second || first == third || second == third) {
                System.out.println("Two numbers match! You won double your bet!");
                money = money + (bet * 2);
            }
            else {
                System.out.println("No matches. You lost your bet.");
            }

            System.out.println("You now have $" + money);

            if (money == 0) {
                System.out.println("You ran out of money!");
                break;
            }

            System.out.print("Do you want to play again? (Yes/No): ");
            play = scanner.next();

            while (!play.equalsIgnoreCase("yes") &&
                   !play.equalsIgnoreCase("y") &&
                   !play.equalsIgnoreCase("no") &&
                   !play.equalsIgnoreCase("n")) {
                System.out.print("Please enter Yes or No: ");
                play = scanner.next();
            }

            if (play.equalsIgnoreCase("no") || play.equalsIgnoreCase("n")) {
                break;
            }
        }

        System.out.println("Game over! You have $" + money + " left.");
        scanner.close(); 
	}
}
