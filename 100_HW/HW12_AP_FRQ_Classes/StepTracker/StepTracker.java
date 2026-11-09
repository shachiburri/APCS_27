public class StepTracker {
    private int minSteps;
    private int totalSteps;
    private int totalDays;
    private int activeDays;

    public StepTracker(int minSteps) {
        this.minSteps = minSteps;
    }

    public int activeDays() {
        return this.activeDays;
    }

    public double averageSteps() {
        if (totalDays == 0) {
            return 0.0;
        }
        return (double) totalSteps / totalDays;
    }

    public void addDailySteps(int steps) {
        if (steps >= minSteps) {
            activeDays++;
        }
        totalSteps += steps;
        totalDays++;
    }
}