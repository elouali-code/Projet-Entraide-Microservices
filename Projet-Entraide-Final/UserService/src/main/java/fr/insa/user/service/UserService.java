package fr.insa.user.service;

import fr.insa.user.model.Student;
import fr.insa.user.repository.StudentRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final StudentRepository studentRepository;

    public UserService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    // CREATE/UPDATE
    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    // READ
    public Optional<Student> findStudentById(Long id) {
        // L'ID est passé ici en paramètre
        return studentRepository.findById(id); 
    }

    // READ : Utilisé par RecommendationService
    public List<Student> findByCompetences(List<String> keywords) {
        return studentRepository.findByCompetencesIn(keywords);
    }

    // DELETE (Méthode CRUD complète)
    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
}