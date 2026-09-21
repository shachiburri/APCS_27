/*
 *	Author: David Neder
 *  Date: 9/18/26
*/

import java.util.Scanner;
import java.util.Random;

class starter {
	public static void main(String args[]) {
		int rand1 = (int)(Math.random()*10);
		int rand2 = (int)(Math.random()*(10)+1);
		double rand3 = (Math.random()*(3.5-2.5)+2.5);
		double rand4 = (Math.random()*(589-14)+14);

		System.out.println("A number between 0 - 9: " + rand1);
		System.out.println("A number between 1 - 10: " + rand2);
		System.out.println("A double between 2.5 and 3.5: " + rand3);
		System.out.println("A double between 14 and 589: " + rand4);
	}
}
