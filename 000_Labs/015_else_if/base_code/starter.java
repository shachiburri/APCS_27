/*
 *	Author: David Neder
 *  Date: 9/30/26
*/

import java.util.Scanner;
import java.util.Random;

class starter {
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);
		int random_number = (int)(Math.random() * 1000 + 1);
		System.out.print("Pick a number between 1 - 1000: ");
		int guess = scanner.nextInt();
		if (guess == random_number) {
			System.out.println("You guessed the correct number! Congrats!");
		}
		else if (guess < random_number) {
			System.out.println("Your number was smaller than the number. The number was " + random_number + ".");
		}
		else if (guess > random_number) {
			System.out.println("Your number was larger than the number. The number was " + random_number + ".");
		}
		scanner.close();
	}
}
