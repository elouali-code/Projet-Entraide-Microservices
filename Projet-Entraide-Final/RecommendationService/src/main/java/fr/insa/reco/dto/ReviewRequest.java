package fr.insa.reco.dto;

// Classe utilisée par le Frontend pour envoyer un avis
public class ReviewRequest {
    private Long helperId; // L'ID de l'étudiant qui a aidé
    private int newRating;  // La nouvelle note donnée (ex: 1 à 5)
    
    // Constructeur vide (par défaut, requis par Spring/Jackson)
    public ReviewRequest() {}
    
    // Getters et Setters (Nécessaires pour la désérialisation JSON)
    
    public Long getHelperId() { 
        return helperId; 
    }
    
    public void setHelperId(Long helperId) { 
        this.helperId = helperId; 
    }
    
    public int getNewRating() { 
        return newRating; 
    }
    
    public void setNewRating(int newRating) { 
        this.newRating = newRating; 
    }
}