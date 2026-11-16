/*
 *	Author: David Neder  
 *  Date: 11/13/26
*/

class starter {
	public static void main(String args[]) {
		String[] lyrics = new String[10];
		lyrics[0] = "Beneath soft pillows and wool";
		lyrics[1] = "Pristine hearts made of gold and jewel";
		lyrics[2] = "A love pure, so rich and full";
		lyrics[3] = "I can see it in your eyes";
		lyrics[4] = "(All of the things)";
		lyrics[5] = "That I've lost I will find again";
		lyrics[6] = "Everything I've done doesn't define what I am";
		lyrics[7] = "(All of the things)";
		lyrics[8] = "That are broken will still be fixed";
		lyrics[9] = "Same old heart with the same old tricks";
		int i = 0;
		while (i < lyrics.length) {
			System.out.println(lyrics[i]);
			i++;
		}
	}
}
