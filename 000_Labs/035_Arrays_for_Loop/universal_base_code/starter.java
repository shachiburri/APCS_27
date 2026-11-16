/*
 *	Author: David Neder
 *  Date: 11/13/26
*/

class starter {
	public static void main(String args[]) {
		int[] arr = new int[1000];
		for (int i = 0; i < arr.length; i++) {
			arr[i] = (int)(Math.random() * 100) + 1;
		}
		for (int i = 0; i < arr.length; i++) {
			System.out.println(arr[i]);
		}
	}
}
