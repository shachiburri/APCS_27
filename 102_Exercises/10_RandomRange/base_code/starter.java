/*
 *	Author: David Neder
 *  Date: 9/17/26
 *	Collaborator(s): -
*/

import java.util.Scanner;

class starter {
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);

		System.out.println("Enter 2 numbers to create a range for your random number");
		
		System.out.print("Please enter an integer: ");
		int num1 = scanner.nextInt();
		System.out.print("Please enter another integer (bigger than the first): ");
		int num2 = scanner.nextInt();

		System.out.println("Your range is " + num1 + " to " + num2 + ".");
		System.out.println("Here are 5 numbers generated in that range.");

		int random1 = (int)(Math.random() * (num2 - num1 + 1)) + num1;
		int random2 = (int)(Math.random() * (num2 - num1 + 1)) + num1;
		int random3 = (int)(Math.random() * (num2 - num1 + 1)) + num1;
		int random4 = (int)(Math.random() * (num2 - num1 + 1)) + num1;
		int random5 = (int)(Math.random() * (num2 - num1 + 1)) + num1;

		System.out.println(random1 + ", " + random2 + ", " + random3 + ", " + random4 + ", " + random5);

		scanner.close();
	}
}
