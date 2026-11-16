/*
 *	Author: David Neder
 *  Date: 11/13/26
*/

class starter {
	public static void main(String args[]) {
		int size = (int)(Math.random() * 150) + 51;
        int[] arr = new int[size];
        int min = Integer.MAX_VALUE;
        int max = Integer.MIN_VALUE;
        int sum = 0;
        for (int i = 0; i < arr.length; i++) {
            arr[i] = (int)(Math.random() * 100) + 1;
        }
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] < min) {
                min = arr[i];
            }
            if (arr[i] > max) {
                max = arr[i];
            }
            sum += arr[i];
        }
        double average = (double) sum / arr.length;
        System.out.println("Number of elements: " + arr.length);
        System.out.println("Minimum: " + min);
        System.out.println("Maximum: " + max);
        System.out.println("Average: " + average);
	}
}
