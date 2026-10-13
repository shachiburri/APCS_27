/*
 *	Author: David Neder
 *  Date: 10/9/26
*/

import java.util.Scanner;

class starter {
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);

        int number = (int)(Math.random() * 1000) + 1;

        while (true) {
            System.out.print("Guess a number between 1 and 1000: ");
            int guess = scanner.nextInt();

            if (guess == number) {
                System.out.println("Correct! You guessed the number!");
                break;
            }

            if (guess > number) {
                System.out.println("Your guess is too high!");
            }

            if (guess < number) {
                System.out.println("Your guess is too low!");
            }
        }
	}
}
