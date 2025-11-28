package fr.insa.reco.dto;

import java.util.List;

public class StudentInfo {
    private Long id;
    private String nom;
    private String prenom; 
    private String filiere;
    private List<String> competences;
    private double noteMoyenneAvis;
    private int nombreAvis;
    private String disponibilites;

    public StudentInfo() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getFiliere() { return filiere; }
    public void setFiliere(String filiere) { this.filiere = filiere; }

    public List<String> getCompetences() { return competences; }
    public void setCompetences(List<String> competences) { this.competences = competences; }

    public double getNoteMoyenneAvis() { return noteMoyenneAvis; }
    public void setNoteMoyenneAvis(double noteMoyenneAvis) { this.noteMoyenneAvis = noteMoyenneAvis; }
    
    public int getNombreAvis() { return nombreAvis; }
    public void setNombreAvis(int nombreAvis) { this.nombreAvis = nombreAvis; }

    public String getDisponibilites() { return disponibilites; }
    public void setDisponibilites(String disponibilites) { this.disponibilites = disponibilites; }
}