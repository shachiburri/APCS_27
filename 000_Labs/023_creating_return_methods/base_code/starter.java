/*
 *	Author: David Neder
 *  Date: 10/15/26
*/

import java.util.Scanner;

class starter {
	public static int pow(int a, int b) {
		int c = 1;
		while (b > 0) {
			c *= a;
			b -= 1;
		}
		return c;
	}
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);
		System.out.println("What is your base number?");
		int base = scanner.nextInt();
		System.out.println("What is your exponent number?");
		int exponent = scanner.nextInt();
		System.out.println("Your answer is: " + pow(base, exponent));
		scanner.close();
	}
}
