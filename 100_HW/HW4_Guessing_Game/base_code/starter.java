/*
 *	Author: David Neder
 *  Date: 9/25/26
 * 	Collaborator: -
*/

import java.util.Scanner;

class starter {
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);
		String guess = "";

		System.out.println("The goal of the game is to guess a word with two hints!");
		System.out.println();

		int question = (int) (Math.random() * 3);

		if (question == 0) {
			System.out.println("It's something you can wear on your feet!");
			System.out.print("What is your guess? ");
			guess = scanner.nextLine();
			System.out.println();

			if (guess.equals("shoe")) {
				System.out.println("You got it! Woo!");
			} else if (guess.equals("Shoe")) {
				System.out.println("You got it! Woo!");
			} else if (guess.equals("shoes")) {
				System.out.println("You got it! Woo!");
			} else if (guess.equals("Shoes")) {
				System.out.println("You got it! Woo!");
			} else {
				System.out.println("You sadly didn't guess right, here's another hint!");
				System.out.println("It usually has laces!");
				guess = scanner.nextLine();
				System.out.println();

				if (guess.equals("shoe")) {
					System.out.println("You got it! Woo!");
				} else if (guess.equals("Shoe")) {
					System.out.println("You got it! Woo!");
				} else if (guess.equals("shoes")) {
					System.out.println("You got it! Woo!");
				} else if (guess.equals("Shoes")) {
					System.out.println("You got it! Woo!");
				} else {
					System.out.println("The answer was shoe, better luck next time!");
				}
			}
		} else if (question == 1) {
			System.out.println("It's something you use at school!");
			System.out.print("What is your guess? ");
			guess = scanner.nextLine();
			System.out.println();

			if (guess.equals("pencil")) {
				System.out.println("You got it! Woo!");
			} else if (guess.equals("Pencil")) {
				System.out.println("You got it! Woo!");
			} else {
				System.out.println("You sadly didn't guess right, here's another hint!");
				System.out.println("You can use it to write and erase!");
				guess = scanner.nextLine();
				System.out.println();

				if (guess.equals("pencil")) {
					System.out.println("You got it! Woo!");
				} else if (guess.equals("Pencil")) {
					System.out.println("You got it! Woo!");
				} else {
					System.out.println("The answer was pencil, better luck next time!");
				}
			}
		} else if (question == 2) {
			System.out.println("It's something you can see in the sky!");
			System.out.print("What is your guess? ");
			guess = scanner.nextLine();
			System.out.println();

			if (guess.equals("moon")) {
				System.out.println("You got it! Woo!");
			} else if (guess.equals("Moon")) {
				System.out.println("You got it! Woo!");
			} else {
				System.out.println("You sadly didn't guess right, here's another hint!");
				System.out.println("You can usually see it clearly at night!");
				guess = scanner.nextLine();
				System.out.println();

				if (guess.equals("moon")) {
					System.out.println("You got it! Woo!");
				} else if (guess.equals("Moon")) {
					System.out.println("You got it! Woo!");
				} else {
					System.out.println("The answer was moon, better luck next time!");
				}
			}
		}

		scanner.close();
	}
}
