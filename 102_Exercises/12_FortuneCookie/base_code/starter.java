/*
 *	Author: Daivd Neder
 *  Date: 9/22/26
 *	Collaborator(s): -
*/

import java.util.Scanner;

class starter {
	public static void main(String args[]) {
		System.out.println("Welcome to the Fortune Cookie Generator!");
		Scanner scanner = new Scanner(System.in);
		int number = (int)(Math.random() * 10);
		String password = "david7";

		System.out.println();
		System.out.print("Password: ");
		String input = scanner.nextLine();

		if (input.equals(password)) {
			System.out.println("Welcome in.");
			System.out.println();
			String fortune = "";

			if (number == 0) fortune = "Big rizz energy is heading your way.";
			if (number == 1) fortune = "No cap, your hard work is about to pay off.";
			if (number == 2) fortune = "Main character energy is unlocked today.";
			if (number == 3) fortune = "Your vibe today is certified immaculate.";
			if (number == 4) fortune = "Plot twist incoming: it all works out.";
			if (number == 5) fortune = "You ate that and left zero crumbs.";
			if (number == 6) fortune = "This is your glow-up era.";
			if (number == 7) fortune = "The whole squad is rooting for you.";
			if (number == 8) fortune = "Your aura points are through the roof today.";
			if (number == 9) fortune = "Slay now, overthink later.";

			System.out.println(fortune);
		}
		else {
			System.out.println("Password incorrect.");
			System.out.println();
			String fortune = "";

			if (number == 0) fortune = "A good idea will find you when you least expect it.";
			if (number == 1) fortune = "Your creativity will open a door today.";
			if (number == 2) fortune = "Patience will turn a small win into a big one.";
			if (number == 3) fortune = "A surprise is on its way, so keep your eyes open.";
			if (number == 4) fortune = "The next step you take will be the right one.";
			if (number == 5) fortune = "Someone will thank you for your kindness this week.";
			if (number == 6) fortune = "Your curiosity will lead you somewhere great.";
			if (number == 7) fortune = "A fresh perspective will solve an old problem.";
			if (number == 8) fortune = "Your hard work will not go unnoticed.";
			if (number == 9) fortune = "The best is yet to come.";

			System.out.println(fortune);
		}
	}
}
