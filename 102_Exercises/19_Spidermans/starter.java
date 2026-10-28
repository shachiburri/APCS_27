/*
	Author: David Neder
	Date: 10/27/26
	Collaborator(s): -
*/

import pkg.*;
import java.util.*;

class starter {
	public static void main(String args[]) {
		Spiderman a = new Spiderman();
		Spiderman b = new Spiderman("Tobey Maguire", 48, "Green Goblin");
		Spiderman c = new Spiderman("Andrew Garfield", 40, "Electro");
		Spiderman d = new Spiderman("Tom Holland", 27, "The Vulture");

		System.out.println(a.getActor() + ", " + a.getAge() + ", " + a.getVillain());
		System.out.println(b.getActor() + ", " + b.getAge() + ", " + b.getVillain());
		System.out.println(c.getActor() + ", " + c.getAge() + ", " + c.getVillain());
		System.out.println(d.getActor() + ", " + d.getAge() + ", " + d.getVillain());

		a.setActor("Peter Parker");
		a.setAge(18);
		a.setVillain("Venom");
		System.out.println(a.getActor() + ", " + a.getAge() + ", " + a.getVillain());
	}
}
