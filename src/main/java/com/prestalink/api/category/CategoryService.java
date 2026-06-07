package com.prestalink.api.category;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public ServiceCategory createCategory(ServiceCategory category) {
        return categoryRepository.save(category);
    }

    public List<ServiceCategory> getAllCategories() {
        return categoryRepository.findAll();
    }
}
