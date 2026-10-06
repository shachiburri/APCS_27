import java.util.Scanner;

public class starter
{
    public static void main(String[] args)
    {
        Scanner input = new Scanner(System.in);

        // Ask for player names
        System.out.print("Enter Player 1's name: ");
        String player1 = input.nextLine();

        System.out.print("Enter Player 2's name: ");
        String player2 = input.nextLine();

        // Generate random dice rolls from 1-6
        int p1Die1 = (int)(Math.random() * 6) + 1;
        int p1Die2 = (int)(Math.random() * 6) + 1;

        int p2Die1 = (int)(Math.random() * 6) + 1;
        int p2Die2 = (int)(Math.random() * 6) + 1;

        // Calculate starting scores
        int player1Score = p1Die1 + p1Die2;
        int player2Score = p2Die1 + p2Die2;

        // Player 1 bonus
        if (p1Die1 == p1Die2)
        {
            player1Score += 3;
            System.out.println(player1 + " got a doubles bonus!");
        }
        else if (p1Die1 + p1Die2 == 7)
        {
            player1Score += 2;
            System.out.println(player1 + " got a Lucky Seven bonus!");
        }

        // Player 2 bonus
        if (p2Die1 == p2Die2)
        {
            player2Score += 3;
            System.out.println(player2 + " got a doubles bonus!");
        }
        else if (p2Die1 + p2Die2 == 7)
        {
            player2Score += 2;
            System.out.println(player2 + " got a Lucky Seven bonus!");
        }

        // Power Roll: doubles OR final score is at least 10
        boolean powerRoll1 =
                (p1Die1 == p1Die2) || (player1Score >= 10);

        boolean powerRoll2 =
                (p2Die1 == p2Die2) || (player2Score >= 10);

        // Print Player 1 results
        System.out.println();
        System.out.println(player1 + " rolled: "
                + p1Die1 + " and " + p1Die2);

        System.out.println(player1 + " final score: "
                + player1Score);

        System.out.println("Power Roll: " + powerRoll1);

        // Print Player 2 results
        System.out.println();
        System.out.println(player2 + " rolled: "
                + p2Die1 + " and " + p2Die2);

        System.out.println(player2 + " final score: "
                + player2Score);

        System.out.println("Power Roll: " + powerRoll2);

        // Determine winner
        System.out.println();

        if (player1Score > player2Score)
        {
            System.out.println(player1 + " wins!");
        }
        else if (player2Score > player1Score)
        {
            System.out.println(player2 + " wins!");
        }
        else
        {
            System.out.println("It's a tie!");
        }

        input.close();
    }
}
