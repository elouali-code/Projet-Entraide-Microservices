package fr.insa.reco;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.reactive.function.client.WebClient;

// SANS dépendances BDD (aucune annotation JPA/Hibernate)
@SpringBootApplication
public class RecommendationApplication {

    public static void main(String[] args) {
        SpringApplication.run(RecommendationApplication.class, args);
    }
    
    // Bean obligatoire pour utiliser WebClient dans les autres services et clients
    @Bean
    public WebClient.Builder getWebClientBuilder() {
        return WebClient.builder();
    }
}