package fr.insa.request.repository;

import fr.insa.request.model.HelpRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RequestRepository extends JpaRepository<HelpRequest, Long> {
    // Méthodes de base CRUD automatiques
}