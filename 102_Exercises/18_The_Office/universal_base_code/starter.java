/*
 *	Author:
 *  Date:
 * 	Collaborator(s):
*/
import pkg.*;
import java.util.Scanner;
import java.util.Random;

class starter {
	public static void main(String args[]) {
		Employee michael = new Employee();
		michael.employeeToString();
		
		Employee dwight = new Employee(1987, "Dwight", "Schrute", 4416.66);
		Employee jim = new Employee(2474, "Jim", "Halpert", 4416.66);
		Employee pam = new Employee(2011, "Pam", "Beesly", 2250.0);
		Employee david = new Employee(2067, "David", "Neder", 27000.0);

		dwight.raiseSalary(15);
		jim.raiseSalary(10);
		pam.raiseSalary(5);
		david.raiseSalary(50);

		dwight.employeeToString();
		System.out.println("Calculated Annual Salary: " + dwight.getAnnualSalary() + "\n");
		jim.employeeToString();
		System.out.println("Calculated Annual Salary: " + jim.getAnnualSalary() + "\n");
		pam.employeeToString();
		System.out.println("Calculated Annual Salary: " + pam.getAnnualSalary() + "\n");
		david.employeeToString();
		System.out.println("Calculated Annual Salary: " + david.getAnnualSalary());
	}
}
