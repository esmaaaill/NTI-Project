package com.quickstay.repository;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quickstay.model.User;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Repository;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class FileUserRepository implements UserRepository {
    private final Path usersPath;
    private final ObjectMapper objectMapper;

    public FileUserRepository(@Value("${app.users-file}") String usersFile, ObjectMapper objectMapper) {
        this.usersPath = Path.of(usersFile);
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    void init() throws IOException {
        Files.createDirectories(usersPath.getParent());
        if (Files.notExists(usersPath)) {
            Files.writeString(usersPath, "[]");
        }
    }

    @Override
    public synchronized List<User> findAll() {
        try {
            return objectMapper.readValue(Files.readString(usersPath), new TypeReference<>() {});
        } catch (IOException e) {
            return new ArrayList<>();
        }
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return findAll().stream().filter(user -> user.email().equalsIgnoreCase(email)).findFirst();
    }

    @Override
    public synchronized User save(User user) {
        List<User> users = new ArrayList<>(findAll());
        users.add(user);
        try {
            Files.writeString(usersPath, objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(users));
        } catch (IOException ignored) {
        }
        return user;
    }
}
