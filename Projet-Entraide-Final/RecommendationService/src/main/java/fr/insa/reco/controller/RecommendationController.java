package fr.insa.reco.controller;

// IMPORTS NÉCESSAIRES POUR CETTE CLASSE
import fr.insa.reco.dto.StudentInfo;
import fr.insa.reco.service.RecommendationService;
import fr.insa.reco.client.UserServiceClient;
import fr.insa.reco.dto.ReviewRequest; 
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "*") 
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserServiceClient userServiceClient; // Nécessaire pour la mise à jour de l'avis

    // Constructeur mis à jour pour injecter les deux services
    public RecommendationController(RecommendationService recommendationService, UserServiceClient userServiceClient) {
        this.recommendationService = recommendationService;
        this.userServiceClient = userServiceClient;
    }

    // ENDPOINT 1 (Celui qui avait l'erreur)
    // GET /api/recommendations/search
    @GetMapping("/api/recommendations/search") 
    public ResponseEntity<List<StudentInfo>> getRecommendations(@RequestParam List<String> keywords) {
        
        List<StudentInfo> recommendedAids = recommendationService.getRecommendedAids(keywords);
        
        if (recommendedAids.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(recommendedAids);
    }

    // ENDPOINT 2 (Pour les avis)
    @PostMapping("/api/recommendations/review")
    public ResponseEntity<Void> handleReviewSubmission(@RequestBody ReviewRequest review) {
        
        try {
            Long helperId = review.getHelperId();
            int newRating = review.getNewRating();

            // 1. RÉCUPÉRER L'ÉTUDIANT (via 8080)
            StudentInfo student = userServiceClient.getStudentById(helperId);
            
            // 2. CALCULER LA NOUVELLE MOYENNE (Logique simplifiée)
            double oldRating = student.getNoteMoyenneAvis();
            double newAverage;
            
            if (oldRating == 0.0) {
                newAverage = newRating; // C'est le premier avis
            } else {
                newAverage = (oldRating + newRating) / 2.0; // Moyenne simplifiée
            }
            
            student.setNoteMoyenneAvis(newAverage);

            // 3. METTRE À JOUR L'ÉTUDIANT (via 8080)
            userServiceClient.updateStudent(helperId, student);
            
            return ResponseEntity.accepted().build(); // 202 Accepted

        } catch (Exception e) {
            System.err.println("Erreur lors de la mise à jour de l'avis: " + e.getMessage());
            return ResponseEntity.badRequest().build(); // 400 Bad Request
        }
    }
}