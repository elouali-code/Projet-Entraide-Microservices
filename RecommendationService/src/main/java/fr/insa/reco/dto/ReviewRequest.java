package fr.insa.reco.dto;

public class ReviewRequest {
    private Long helperId;
    private int newRating;
    
    public ReviewRequest() {}
    
    public Long getHelperId() { return helperId; }
    public void setHelperId(Long helperId) { this.helperId = helperId; }
    
    public int getNewRating() { return newRating; }
    public void setNewRating(int newRating) { this.newRating = newRating; }
}