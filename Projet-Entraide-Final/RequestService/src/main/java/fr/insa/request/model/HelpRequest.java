package fr.insa.request.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "help_requests")
public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Long studentId; // ID de l'étudiant demandeur
    private String titre;
    private String description;
    
    @ElementCollection
    @CollectionTable(name = "request_keywords", joinColumns = @JoinColumn(name = "request_id"))
    private List<String> motsCles = new ArrayList<>();

    private LocalDateTime dateSouhaitee;
    private String statut; // Le champ qui posait problème

    // Constructeur sans argument (OBLIGATOIRE pour JPA)
    public HelpRequest() {}
    
    // --- Getters et Setters (Complétés pour résoudre l'erreur setStatut) ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<String> getMotsCles() { return motsCles; }
    public void setMotsCles(List<String> motsCles) { this.motsCles = motsCles; }

    public LocalDateTime getDateSouhaitee() { return dateSouhaitee; }
    public void setDateSouhaitee(LocalDateTime dateSouhaitee) { this.dateSouhaitee = dateSouhaitee; }

    // CORRECTION : Méthode setStatut correctement définie
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; } 
}