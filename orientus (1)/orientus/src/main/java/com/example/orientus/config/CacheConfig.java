package com.example.orientus.config;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * AMÉLIORATION 6 : Cache Spring Boot
 * Utilise ConcurrentMapCacheManager (simple, suffisant pour le moment).
 * Les caches sont invalidés automatiquement dans ProgramService
 * lors du create/update/delete.
 *
 * Caches définis :
 * - "all-programs" : résultat de /api/programs/all
 * - "program-filters" : résultat de /api/programs/filters
 * - "program-countries", "program-categories", "program-degrees", "program-languages" : metadata individuelles
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        return new ConcurrentMapCacheManager(
                "all-programs",
                "program-filters",
                "program-countries",
                "program-categories",
                "program-degrees",
                "program-languages"
        );
    }
}

