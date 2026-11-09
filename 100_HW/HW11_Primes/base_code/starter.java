/*
 *	Author: David Neder
 *  Date: 11/5/26
*/

import java.util.Scanner;

class starter {
	public static boolean checkPrime(int num) {
		int i = 2;
		while (i < num) {
			if ((num % (i++)) == 0) {
				return false;
			}
		}
		return true;
	}
	public static void printPrimes(int num) {
		int i = 1;
		while (i < num) {
			if (checkPrime(++i)) {
				System.out.println(i);
			}
		}
	}
	public static void main(String args[]) {
		Scanner sc = new Scanner(System.in);
		System.out.print("Input a number and we'll print out every prime until that number: ");
		printPrimes(sc.nextInt());
	}
}
