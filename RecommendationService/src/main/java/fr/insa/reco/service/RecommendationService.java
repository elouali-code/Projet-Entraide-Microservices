package fr.insa.reco.service;

import fr.insa.reco.client.UserServiceClient;
import fr.insa.reco.dto.ReviewRequest;
import fr.insa.reco.dto.StudentInfo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.DayOfWeek;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final UserServiceClient userServiceClient;

    public RecommendationService(UserServiceClient userServiceClient) {
        this.userServiceClient = userServiceClient;
    }

    public List<StudentInfo> getRecommendedAids(List<String> keywords, String dateString) {
        // 1. Récupérer les étudiants compétents
        List<StudentInfo> students = userServiceClient.getStudentsByKeywords(keywords);

        // 2. Calculer le Jour de la semaine à partir de la date (YYYY-MM-DD)
    
        LocalDate date = LocalDate.parse(dateString);
        String dayName = date.getDayOfWeek().toString(); // "MONDAY", "TUESDAY"...

        System.out.println("Recherche pour le jour : " + dayName);

        // 3. FILTRAGE : On garde ceux qui ont ce jour dans leurs disponibilités
        return students.stream()
                .filter(s -> {
                    if (s.getDisponibilites() == null) return false;
                    return s.getDisponibilites().toUpperCase().contains(dayName);
                })
                .collect(Collectors.toList());
    }

    public void processReview(ReviewRequest review) {
        Long helperId = review.getHelperId();
        int newRating = review.getNewRating();

        StudentInfo student = userServiceClient.getStudentById(helperId);
        
        double currentAvg = student.getNoteMoyenneAvis();
        int count = student.getNombreAvis();

        double newAvg;
        if (count == 0) {
            newAvg = newRating;
        } else {
            newAvg = ((currentAvg * count) + newRating) / (count + 1.0);
        }
        
        student.setNoteMoyenneAvis(newAvg);
        student.setNombreAvis(count + 1);

        userServiceClient.updateStudent(helperId, student);
    }
}