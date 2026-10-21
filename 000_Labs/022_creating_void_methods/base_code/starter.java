/*
 *	Author: David Neder
 *  Date: 10/15/26
*/

import java.util.Scanner;

class starter {
	public static void toString(String var) {
		System.out.println(var);
	}
	public static void toStringCombined(String var1, String var2) {
		System.out.println(var1 + " " + var2);
	}
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);
		System.out.println("Write a sentence!");
		String sentence1 = scanner.nextLine();
		System.out.println("Write a sentence!");
		String sentence2 = scanner.nextLine();
		System.out.println("\nThis is using the methods!");
		toString(sentence1);
		toStringCombined(sentence1, sentence2);
		scanner.close();
	}
}
