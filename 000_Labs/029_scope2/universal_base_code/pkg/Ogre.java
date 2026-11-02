/*
 *	Author: David Neder
 *  Date: 10/29/26
*/

package pkg;
import java.util.Scanner;
import java.util.Random;


private class Ogre {
	private String name;
	private boolean ugly;

	public Ogre() {
		name = "Shrek";
		ugly = true;
	}

	public String getName(){
		return name;
	}

	public boolean isUgly(){
		return ugly;
	}

	private void interact(Donkey donkey){
		System.out.println(donkey.getName() + ", what are you doing in my swamp?!");
	}
}
