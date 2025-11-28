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

    public Student saveStudent(Student student) {
        return studentRepository.save(student);
    }

    public Optional<Student> findStudentById(Long id) {
        return studentRepository.findById(id); 
    }

    public List<Student> findByCompetences(List<String> keywords) {
        return studentRepository.findByCompetencesIn(keywords);
    }

    public void deleteStudent(Long id) {
        studentRepository.deleteById(id);
    }
}