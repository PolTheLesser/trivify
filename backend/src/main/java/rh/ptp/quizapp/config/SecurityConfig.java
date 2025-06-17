package rh.ptp.quizapp.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.CorsUtils;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import rh.ptp.quizapp.security.JwtAuthenticationFilter;
import rh.ptp.quizapp.service.CustomUserDetailsService;

import java.util.Arrays;

/**
 * Konfigurationsklasse für die Sicherheit der Anwendung.
 * Stellt CORS, Authentifizierung, Autorisierung und JWT-Filter bereit.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthFilter;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    /** URL des Frontends, für CORS-Freigaben. */
    @Value("${frontend.url}")
    private String frontendUrl;

    /**
     * Konfiguriert die HTTP-Sicherheitsfilterkette inklusive CORS, CSRF, Autorisierungsregeln und JWT.
     *
     * @param http die {@link HttpSecurity}-Instanz
     * @return die konfigurierte {@link SecurityFilterChain}
     * @throws Exception bei Konfigurationsfehlern
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin))
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                        .requestMatchers("/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/verify-email/**").permitAll()
                        .requestMatchers("/api/users/**").permitAll()
                        .requestMatchers("/api/quizzes", "/api/quizzes/my-quizzes", "/api/quizzes/daily").permitAll()
                        .requestMatchers("/auth/**", "/error").permitAll()
                        .requestMatchers("/api/quizzes/{id}").permitAll()
                        .requestMatchers("/api/{id}/submit-all").permitAll()
                        .requestMatchers("/api/quizzes/{id}/submit").permitAll()
                        .requestMatchers("/api/quizzes/{id}/rate").permitAll()
                        .requestMatchers("/api/daily", "/api/daily/**").permitAll()
                        .requestMatchers("/api/{id}").permitAll()
                        .requestMatchers("/api/quiz-results/scores/top").permitAll()
                        .requestMatchers("/api/categories").permitAll()
                        .requestMatchers("/api/categories/values").permitAll()
                        .requestMatchers("/api/admin", "/api/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Erstellt die CORS-Konfiguration für eingehende HTTP-Anfragen.
     *
     * @return eine konfigurierte {@link CorsConfigurationSource}
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(frontendUrl));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    /**
     * Erstellt und konfiguriert den Authentifizierungsanbieter mit benutzerdefiniertem UserDetailsService.
     *
     * @return ein konfigurierter {@link AuthenticationProvider}
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    /**
     * Erstellt den Authentifizierungsmanager zur Verwaltung von Login-Vorgängen.
     *
     * @param config die {@link AuthenticationConfiguration}
     * @return ein {@link AuthenticationManager}
     * @throws Exception bei Fehlern in der Konfiguration
     */
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    /**
     * Erstellt einen BCryptPasswordEncoder zur sicheren Passwort-Hashing.
     *
     * @return ein {@link PasswordEncoder} mit BCrypt
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}