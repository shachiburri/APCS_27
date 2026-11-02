/*
 *	Author: David Neder
 *  Date: 10/30/26
*/

import pkg.*;
import java.util.Scanner;
import java.util.Random;

class starter {
	public static String randName(){
		int rand = (int)(Math.random()*7);
		switch(rand){
			case 0: return "Dopey"; 
			case 1: return "Bashful";
			case 2: return "Grumpy";
			case 3: return "Sleepy";
			case 4: return "Sneezy";
			case 5: return "Happy";
			case 6: return "Doc";
            default: return "Happy";
		}
	}

	public static void main(String args[]) {
        PooleDwarf dwarf1 = new PooleDwarf(randName(), (int)(Math.random() * 100) + 1);
        PooleDwarf dwarf2 = new PooleDwarf(randName(), (int)(Math.random() * 100) + 1);
        PooleDwarf dwarf3 = new PooleDwarf(randName(), (int)(Math.random() * 100) + 1);
        PooleDwarf dwarf4 = new PooleDwarf(randName(), (int)(Math.random() * 100) + 1);
        PooleDwarf dwarf5 = new PooleDwarf(randName(), (int)(Math.random() * 100) + 1);
        PooleDwarf dwarf6 = new PooleDwarf(randName(), (int)(Math.random() * 100) + 1);
        PooleDwarf dwarf7 = new PooleDwarf(randName(), (int)(Math.random() * 100) + 1);

        int duplicates = 0;
        if (dwarf1.isSameName(dwarf2.getName())) duplicates++;
        if (dwarf1.isSameName(dwarf3.getName())) duplicates++;
        if (dwarf1.isSameName(dwarf4.getName())) duplicates++;
        if (dwarf1.isSameName(dwarf5.getName())) duplicates++;
        if (dwarf1.isSameName(dwarf6.getName())) duplicates++;
        if (dwarf1.isSameName(dwarf7.getName())) duplicates++;

        System.out.println("There were " + duplicates + " duplicates of " + dwarf1.getName() + ".");
    }
}
