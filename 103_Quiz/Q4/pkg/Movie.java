package pkg;

public class Movie {
    private String name;
    private double rating;
    private int numRatings;
    private int revenue;

    public Movie() {
        this.name = "Avengers";
        this.rating = 8.0;
        this.numRatings = 33;
        this.revenue = 623357910;
    }

    public Movie(String name, double rating, int numRatings, int revenue) {
        this.name = name;
        this.rating = rating;
        this.numRatings = numRatings;
        this.revenue = revenue;
    }

    public void movieToString() {
        System.out.println("Movie: " + this.name);
        System.out.println("Rating: " + this.rating);
        System.out.println("Number of Ratings: " + this.numRatings);
        System.out.println("Revenue: " + this.revenue);
    }

    public String getMovieName() {
        return this.name;
    }

    public int getRevenue() {
        return this.revenue;
    }

    public void addRating(double rating) {
        this.rating = ((this.rating * this.numRatings) + rating) / (double) (this.numRatings + 1);
        this.numRatings++;
    }

    public boolean compareRatings(Movie movie) {
        if (this.rating > movie.rating) {
            return true;
        }
        else {
            return false;
        }
    }

    public Movie pirateMovie() {
        return new Movie(this.name, this.rating, this.numRatings, this.revenue);
    }
}