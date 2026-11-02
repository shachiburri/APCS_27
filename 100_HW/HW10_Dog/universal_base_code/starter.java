/*
 *	Author: David Neder
 *  Date: 10/31/26
 *	Collaborator(s): -
*/

import pkg.*;
import java.util.Scanner;
import java.util.Random;


class starter {
	public static void main(String args[]) {
		Dog firstDog = new Dog("Buddy");
        firstDog.setAge(4);

        Dog secondDog = new Dog("Max", "Golden Retriever");

        boolean firstDogBarked = false;

        if (firstDog.isSleeping()) {
            System.out.println(firstDog.getName() + " is asleep.");
        } else {
            firstDog.bark();
            firstDogBarked = true;
        }

        if (secondDog.isSleeping()) {
            if (firstDogBarked) {
                secondDog.bark();
            }
        } else {
            if (firstDogBarked) {
                secondDog.bark();
            }
        }
	}
}
