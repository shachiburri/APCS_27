/*
 *	Author: David Neder
 *  Date: 10/9/26
*/

import java.util.Scanner;

class starter {
	public static void main(String args[]) {
		Scanner scanner = new Scanner(System.in);

        System.out.print("Please enter your name: ");
        String name = scanner.nextLine();

        System.out.println();

        System.out.print("Please enter how many times you'd like to print your name: ");
        int x = scanner.nextInt();

        int count = 0;

        while (true) {
            if (count >= x) {
                break;
            }

            System.out.println(name);
            count = count + 1;
        }
	}
}
