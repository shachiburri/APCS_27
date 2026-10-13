/*
 *	Author: David Neder
 *  Date: 10/8/26
*/

import java.util.*;

public class starter {
    public static void main(String[] args) {
        int number = 10;
        String message;
        int bonus = 0;
        int x = 0;

        if (number > 5) {
            message = "Number is greater than 5!";
            System.out.println(message);
        }

        if (number < 20) {
            bonus = 5;
            number = number + bonus;
        }

        System.out.println("Bonus was: " + bonus);

        if (x == 0) {
            System.out.println("x is zero!");
        }

        number = 100;
        System.out.println("Final number: " + number);
    }
}
