package fr.insa.reco.client;

import fr.insa.reco.dto.StudentInfo;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

// IMPORTS NÉCESSAIRES POUR CETTE CLASSE
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceClient {

    private final WebClient webClient;
    private final String userServiceUrl = "http://localhost:8080/api/users"; 

    public UserServiceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(userServiceUrl).build();
    }

    // MÉTHODE 1 (Celle qui avait l'erreur)
    // Appelle GET http://localhost:8080/api/users/search/by-competences?keywords=...
    public List<StudentInfo> getStudentsByKeywords(List<String> keywords) {
        // Convertit la liste [java, sql] en chaîne "java,sql"
        String keywordsString = keywords.stream().collect(Collectors.joining(","));
        
        try {
             return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/users/search/by-competences")
                            .queryParam("keywords", keywordsString)
                            .build())
                    .retrieve()
                    .bodyToFlux(StudentInfo.class) 
                    .collectList()
                    .block(); 
        } catch (Exception e) {
            System.err.println("Erreur lors de l'appel à l'UserService (getStudentsByKeywords): " + e.getMessage());
            return List.of(); 
        }
    }
    
    // MÉTHODE 2 (Nécessaire pour la mise à jour des avis)
    // GET /api/users/{id}
    public StudentInfo getStudentById(Long studentId) {
        return webClient.get()
                .uri("/{id}", studentId)
                .retrieve()
                .bodyToMono(StudentInfo.class)
                .block(); 
    }

    // MÉTHODE 3 (Nécessaire pour la mise à jour des avis)
    // PUT /api/users/{id}
    public void updateStudent(Long studentId, StudentInfo student) {
        webClient.put()
                .uri("/{id}", studentId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(Mono.just(student), StudentInfo.class)
                .retrieve()
                .bodyToMono(Void.class)
                .block(); 
    }
}