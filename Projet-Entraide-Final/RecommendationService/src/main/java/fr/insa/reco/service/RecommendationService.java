package fr.insa.reco.service;

import fr.insa.reco.client.UserServiceClient;
import fr.insa.reco.dto.StudentInfo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final UserServiceClient userServiceClient;

    public RecommendationService(UserServiceClient userServiceClient) {
        this.userServiceClient = userServiceClient;
    }

 // Dans RecommendationService.java

    public List<StudentInfo> getRecommendedAids(List<String> keywords) {
        List<StudentInfo> students = userServiceClient.getStudentsByKeywords(keywords);

        // LOGIQUE PROPRE : Si la note est >= 4.0 ou si l'étudiant est nouveau (note 0.0), incluez-le.
        return students.stream()
                .filter(s -> s.getNoteMoyenneAvis() >= 4.0 || s.getNoteMoyenneAvis() == 0.0) 
                .collect(Collectors.toList());
    }
}