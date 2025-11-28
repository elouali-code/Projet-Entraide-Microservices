package fr.insa.reco.client;

import fr.insa.reco.dto.StudentInfo;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceClient {

    private final WebClient webClient;
    private final String userServiceUrl = "http://localhost:8080/api/users"; 

    public UserServiceClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.baseUrl(userServiceUrl).build();
    }

    // GET Liste par compétences
    public List<StudentInfo> getStudentsByKeywords(List<String> keywords) {
        String keywordsString = keywords.stream().collect(Collectors.joining(","));
        try {
             return webClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/search/by-competences")
                            .queryParam("keywords", keywordsString)
                            .build())
                    .retrieve()
                    .bodyToFlux(StudentInfo.class) 
                    .collectList()
                    .block(); 
        } catch (Exception e) {
            System.err.println("Erreur appel UserService: " + e.getMessage());
            return List.of(); 
        }
    }
    
    // GET Un étudiant
    public StudentInfo getStudentById(Long studentId) {
        return webClient.get()
                .uri("/{id}", studentId)
                .retrieve()
                .bodyToMono(StudentInfo.class)
                .block(); 
    }

    // PUT Mise à jour étudiant
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