package com.prestalink.api.category;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ServiceCategory createCategory(@RequestBody ServiceCategory category) {
        return categoryService.createCategory(category);
    }

    @GetMapping
    public List<ServiceCategory> getAllCategories() {
        return categoryService.getAllCategories();
    }
}
