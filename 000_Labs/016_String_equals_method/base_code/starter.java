/*
 *	Author: David Neder
 *  Date: 9/30/26
*/

import java.util.Scanner;
import java.util.Random;

class starter {
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);
		System.out.println("Would you like to be a Wizard, Warrior, or Rogue?");
		String chosenClass = scanner.nextLine();
		if (chosenClass.equals("Wizard") || chosenClass.equals("wizard")) {
			System.out.println("You've chosen the Wizard! Excelsior!");
		}
		else if (chosenClass.equals("Warrior") || chosenClass.equals("warrior")) {
			System.out.println("You've chosen the Warrior! For honor!");
		}
		else if (chosenClass.equals("Rogue") || chosenClass.equals("rogue")) {
			System.out.println("You've chosen the Rogue! How cunning!");
		}
		scanner.close();
	}
}
