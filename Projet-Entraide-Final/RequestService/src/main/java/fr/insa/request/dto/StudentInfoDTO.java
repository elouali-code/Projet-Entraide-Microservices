package fr.insa.request.dto;

// Ce DTO sert à mapper la réponse basique reçue de l'UserService
public class StudentInfoDTO {
    private String nom;
    private String filiere;

    // Getters et Setters complets
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getFiliere() { return filiere; }
    public void setFiliere(String filiere) { this.filiere = filiere; }
}