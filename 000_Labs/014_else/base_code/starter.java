/*
 *	Author: David Neder
 *  Date: 9/24/26
*/

import java.util.Scanner;

class starter {
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);

		int randomNumber = (int) (Math.random() * 1000) + 1;

		System.out.print("Pick a number between 1 - 1000: ");
		int pickedNumber = scanner.nextInt();

		if (pickedNumber == randomNumber) {
			System.out.println("You guessed the correct number! Congrats!");
		}
		else {
			System.out.println("Your number wasn't the random number. The number was " + randomNumber + ".");
		}

		scanner.close();
	}
}
