/*
 *	Author: David Neder
 *  Date: 10/23/26
 *	Collaborator(s): -
*/

import java.util.Scanner;

class starter {
    public static String getObject() {
        int randomNumber = (int) (Math.random() * 3);
        if (randomNumber == 0) {
            return "rock";
        }
        else if (randomNumber == 1) {
            return "paper";
        }
        else {
            return "scissors";
        }
    }

    public static int compare2(String player1, String player2) {
        if (player1.equals(player2)) {
            return 0;
        }
        if ((player1.equals("rock") && player2.equals("scissors")) ||
            (player1.equals("paper") && player2.equals("rock")) ||
            (player1.equals("scissors") && player2.equals("paper"))) {
            return 1;
        }
        return 2;
    }

    public static void main(String[] args) {
        Scanner input = new Scanner(System.in);
        while (true) {
            System.out.println("Would you like to play? (yes/no/done)");
            String choice = input.nextLine().trim().toLowerCase();
            if (choice.equals("yes")) {
                String playerObject;
                while (true) {
                    System.out.println("Please enter rock, paper, or scissors:");
                    playerObject = input.nextLine().trim().toLowerCase();
                    if (playerObject.equals("rock") ||
                        playerObject.equals("paper") ||
                        playerObject.equals("scissors")) {
                        break;
                    }
                    System.out.println("Invalid choice. Try again!");
                }
                String computerObject = getObject();
                System.out.println("You chose: " + playerObject);
                System.out.println("Computer chose: " + computerObject);
                int winner = compare2(playerObject, computerObject);
                if (winner == 0) {
                    System.out.println("It's a tie!");
                }
                else if (winner == 1) {
                    System.out.println("You win!");
                }
                else {
                    System.out.println("Computer wins!");
                }
            }
            else if (choice.equals("no")) {
                int games;
                while (true) {
                    System.out.println("How many times should the computer play itself?");
                    String answer = input.nextLine().trim();
                    try {
                        games = Integer.parseInt(answer);
                        if (games > 0) {
                            break;
                        }
                    } catch (NumberFormatException e) {
                    }
                    System.out.println("Please enter a positive whole number.");
                }
                int player1Wins = 0;
                int player2Wins = 0;
                int ties = 0;
                for (int i = 0; i < games; i++) {
                    String player1 = getObject();
                    String player2 = getObject();
                    int winner = compare2(player1, player2);
                    if (winner == 0) {
                        ties++;
                    }
                    else if (winner == 1) {
                        player1Wins++;
                    }
                    else {
                        player2Wins++;
                    }
                }
                System.out.println("--- Game Summary ---");
                System.out.println("Total games: " + games);
                System.out.println("Player 1 wins: " + player1Wins);
                System.out.println("Player 2 wins: " + player2Wins);
                System.out.println("Ties: " + ties);
            }
            else if (choice.equals("done")) {
                System.out.println("Thanks for playing!");
                break;
            }
            else {
                System.out.println("Invalid input. Please type yes, no, or done.");
            }
            System.out.println();
        }
        input.close();
    }
}
