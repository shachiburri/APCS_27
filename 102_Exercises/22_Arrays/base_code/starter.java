/*
 *	Author: David Neder
 *  Date: 11/9/26
*/
import java.util.Scanner;

class starter {
	public static int[] createArray(int len, int initialValue, int change) {
		int[] arr = new int[len];
		int i = 0;
		int num = initialValue;
		while (i < arr.length) {
			arr[i++] = num;
			num += change;
		}
		return arr;
	}
	
	public static void printArray(int[] arr) {
		int i = 0;
		while (i < arr.length) {
			System.out.print(arr[i++] + ", ");
		}
	}
	
	public static void main(String args[]) {
		int[] arr1 = createArray(1001, 3, 3);
		int[] arr2 = createArray(1001, 1000, -1);
		printArray(arr1);
		System.out.println("--------------------------------------------------------");
		printArray(arr2);
	}
}
