package fr.insa.user.repository;

import fr.insa.user.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    // Méthode personnalisée pour la fonctionnalité de recommandation
    // JPA trouve les étudiants dont les compétences correspondent aux mots-clés.
    List<Student> findByCompetencesIn(List<String> keywords);
}