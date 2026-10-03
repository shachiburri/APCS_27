/*
 *	Author: David Neder
 *  Date: 9/30/26
*/

import java.util.Scanner;

class starter {
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);

		System.out.println("What is your name?");
		String name = scanner.nextLine();

		System.out.println("What is your title? Ex: Slayer of Dragons");
		String title = scanner.nextLine();

		System.out.println("Would you like to be a Wizard, Warrior, or Rogue?");
		String clazz = scanner.nextLine();

		if (clazz.equals("Wizard") || clazz.equals("wizard")) {
			System.out.println("You've chosen the Wizard! Excelsior!");
		}
		else if (clazz.equals("Warrior") || clazz.equals("warrior")) {
			System.out.println("You've chosen the Warrior! For honor!");
		}
		else if (clazz.equals("Rogue") || clazz.equals("rogue")) {
			System.out.println("You've chosen the Rogue! How cunning!");
		}
		else {
			System.out.println("You've decided not to choose a role. Rerun program.");
		}

		System.out.println("\nYou have 20 skill points to spend in the following: Strength, Dexterity, Intelligence, Constitution, and Charisma. Spend them wisely.\n");

		int skillPoints = 20;

		System.out.print("Strength (1-10): ");
		int strength = scanner.nextInt();

		if (strength <= skillPoints && strength <= 10) {
			skillPoints -= strength;
		}
		else {
			System.out.print("Please input a smaller value. Strength (1-10): ");
			strength = scanner.nextInt();
			skillPoints -= strength;
		}

		System.out.println("You have " + skillPoints + " left to spend.\n");

		System.out.print("Dexterity (1-10): ");
		int dexterity = scanner.nextInt();

		if (dexterity <= skillPoints && dexterity <= 10) {
			skillPoints -= dexterity;
		}
		else {
			System.out.print("Please input a smaller value. Dexterity (1-10): ");
			dexterity = scanner.nextInt();
			skillPoints -= dexterity;
		}

		System.out.println("You have " + skillPoints + " left to spend.\n");

		System.out.print("Intelligence (1-10): ");
		int intelligence = scanner.nextInt();

		if (intelligence <= skillPoints && intelligence <= 10) {
			skillPoints -= intelligence;
		}
		else {
			System.out.print("Please input a smaller value. Intelligence (1-10): ");
			intelligence = scanner.nextInt();
			skillPoints -= intelligence;
		}

		System.out.println("You have " + skillPoints + " left to spend.\n");

		System.out.print("Constitution (1-10): ");
		int constitution = scanner.nextInt();

		if (constitution <= skillPoints && constitution <= 10) {
			skillPoints -= constitution;
		}
		else {
			System.out.print("Please input a smaller value. Constitution (1-10): ");
			constitution = scanner.nextInt();
			skillPoints -= constitution;
		}

		System.out.println("You have " + skillPoints + " left to spend.\n");

		System.out.print("Charisma (1-10): ");
		int charisma = scanner.nextInt();

		if (charisma <= skillPoints && charisma <= 10) {
			skillPoints -= charisma;
		}
		else {
			System.out.print("Please input a smaller value. Charisma (1-10): ");
			charisma = scanner.nextInt();
			skillPoints -= charisma;
		}

		System.out.println("");

		if (skillPoints > 0) {
			System.out.println("You have " + skillPoints + " to spend for next time.");
		}

		System.out.println("--------------------------------------------------");
		System.out.println("You are " + name + ", the " + title + " of CVHS.");
		System.out.println("You're a " + clazz + " with the following stats!");
		System.out.println("Strength - " + strength);
		System.out.println("Dexterity - " + dexterity);
		System.out.println("Intelligence - " + intelligence);
		System.out.println("Constitution - " + constitution);
		System.out.println("Charisma - " + charisma);
		System.out.println("");
		System.out.println("Good luck on your quest " + name + "!");

		scanner.close();
	}
}
