package fr.insa.request.model;

import jakarta.persistence.*;
import java.time.LocalDate; // <-- UTILISER LocalDate (Pas LocalDateTime)
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "help_requests")
public class HelpRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long studentId; 
    private String titre;
    private String description;
    
    @ElementCollection
    @CollectionTable(name = "request_keywords", joinColumns = @JoinColumn(name = "request_id"))
    private List<String> motsCles = new ArrayList<>();
    
    private LocalDate dateSouhaitee; 
    
    private String statut; 
    private Long helperId;

    public HelpRequest() {}
    
    // Getters et Setters
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
    
    public LocalDate getDateSouhaitee() { return dateSouhaitee; }
    public void setDateSouhaitee(LocalDate dateSouhaitee) { this.dateSouhaitee = dateSouhaitee; }
    
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    
    public Long getHelperId() { return helperId; }
    public void setHelperId(Long helperId) { this.helperId = helperId; }
}