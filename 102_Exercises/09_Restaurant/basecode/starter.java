/*
 *	Author: David Neder
 *  Date: 9/15/26
*/

import java.util.Scanner;

class starter {
	public static void main(String args[]) {
		
		Scanner scanner = new Scanner(System.in);
		
		System.out.println("=================================================\n            WELCOME RESTAURANT OWNER!            \n=================================================");
		
		System.out.print("\nWhat's the name of your restaurant? ");
		String restaurantName = scanner.nextLine();

		System.out.print("\nWhat's your name? ");
		String name = scanner.nextLine();

		System.out.println("\nGreat to see you, " + name + "! Let's set up a menu for " + restaurantName + "!");
		System.out.println("Tonight's menu has room for exactly 3 items. Let's go!");

		System.out.println("\n--- Item #1 ---");
		System.out.print("Item name: ");
		String item1Name = scanner.nextLine();
		System.out.print("Price of " + item1Name + " ($): ");
		double item1Price = scanner.nextDouble();
		System.out.print("How many " + item1Name + " would you like? ");
		int item1Quantity = scanner.nextInt();
		double item1Sum = item1Price * item1Quantity;
		System.out.println("Added " + item1Quantity + "x " + item1Name + " to your order! ($" + item1Sum + ")");

		scanner.nextLine();

		System.out.println("--- Item #2 ---");
		System.out.print("Item name: ");
		String item2Name = scanner.nextLine();
		System.out.print("Price of " + item2Name + " ($): ");
		double item2Price = scanner.nextDouble();
		System.out.print("How many " + item2Name + " would you like? ");
		int item2Quantity = scanner.nextInt();
		double item2Sum = item2Price * item2Quantity;
		System.out.println("Added " + item2Quantity + "x " + item2Name + " to your order! ($" + item2Sum + ")");
		
		scanner.nextLine();

		System.out.println("--- Item #3 ---");
		System.out.print("Item name: ");
		String item3Name = scanner.nextLine();
		System.out.print("Price of " + item3Name + " ($): ");
		double item3Price = scanner.nextDouble();
		System.out.print("How many " + item3Name + " would you like? ");
		int item3Quantity = scanner.nextInt();
		double item3Sum = item3Price * item3Quantity;
		System.out.println("Added " + item3Quantity + "x " + item3Name + " to your order! ($" + item3Sum + ")");

		System.out.print("Nice choices! What tip percentage would you like to leave? (ex: 15, 18, 20): ");
		double tipPercentage = scanner.nextDouble();
		
		double subtotal = item1Sum + item2Sum + item3Sum;
		double tipAmount = subtotal / 100 * tipPercentage;
		double tax = subtotal / 100 * 9.75;
		double total = subtotal + tipAmount + tax;

		System.out.println("\n=================================================\n              " + restaurantName + " - Menu For Today              \n=================================================");
		System.out.println("Owner: " + name);
		System.out.println("-------------------------------------------------");
		System.out.println("Item                Qty     Price");
		System.out.println("-------------------------------------------------");
		System.out.println(item1Name + "                    " + item1Quantity + "     " + item1Price);
		System.out.println(item2Name + "                    " + item2Quantity + "     " + item2Price);
		System.out.println(item3Name + "                    " + item3Quantity + "     " + item3Price);
		System.out.println("-------------------------------------------------");
		System.out.println("Subtotal:                  " + subtotal);
		System.out.println("Tax (9.75%):               " + tax);
		System.out.println("Tip:                       " + tipPercentage);
		System.out.println("Tip Amount:                " + tipAmount);
		System.out.println("=================================================");
		System.out.println("TOTAL:                    $" + total);
		System.out.println("=================================================");

		System.out.println("\nThanks for eating at " + restaurantName + "!");
		System.out.println("Come back soon -- we'll always have a byte for you!");

		scanner.close();
	}
}
