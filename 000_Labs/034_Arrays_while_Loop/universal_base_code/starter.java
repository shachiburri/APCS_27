/*
 *	Author: David Neder
 *  Date: 11/13/26
*/

class starter {
	public static void main(String args[]) {		
		int[] arr = new int[1000];
		int i = 0;
		while (i < arr.length) {
			arr[i] = (int)(Math.random() * 100) + 1;
			i++;
		}
		int j = 0;
		while (j < arr.length) {
			System.out.println(arr[j]);
			j++;
		}
	}
}
