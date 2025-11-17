package fr.insa.reco.dto;

import java.util.List;

// Modèle des données reçues de l'UserService (pas une entité JPA)
public class StudentInfo {
    private Long id;
    private String nom;
    private String filiere;
    private List<String> competences;
    private double noteMoyenneAvis;

    // Getters et Setters complets
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getFiliere() { return filiere; }
    public void setFiliere(String filiere) { this.filiere = filiere; }

    public List<String> getCompetences() { return competences; }
    public void setCompetences(List<String> competences) { this.competences = competences; }

    public double getNoteMoyenneAvis() { return noteMoyenneAvis; }
    public void setNoteMoyenneAvis(double noteMoyenneAvis) { this.noteMoyenneAvis = noteMoyenneAvis; }
}