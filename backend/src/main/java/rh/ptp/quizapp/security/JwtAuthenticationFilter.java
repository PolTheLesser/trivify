package rh.ptp.quizapp.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import rh.ptp.quizapp.service.CustomUserDetailsService;

import java.io.IOException;

/**
 * Filter zur JWT-Authentifizierung, der bei jedem Request geprüft wird.
 */
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    /**
     * Gibt an, ob der Filter bei bestimmten Pfaden nicht ausgeführt werden soll.
     *
     * @param request HTTP-Request
     * @return true, wenn der Filter übersprungen werden soll
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/auth/") ||
                path.equals("/api/quizzes/daily") ||
                path.matches("/api/quizzes/\\d+/submit");
    }

    /**
     * Führt die Filterlogik aus, um JWT-Tokens zu validieren und Authentifizierungsinformationen im Kontext zu speichern.
     *
     * @param request HTTP-Request
     * @param response HTTP-Response
     * @param filterChain Filterkette
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            final String authHeader = request.getHeader("Authorization");
            final String jwt;
            final String userEmail;

            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                logger.debug("Kein JWT Token gefunden in Authorization Header");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                filterChain.doFilter(request, response);
                return;
            }

            jwt = authHeader.substring(7);
            userEmail = jwtService.extractUsername(jwt);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    logger.debug("JWT Token erfolgreich validiert für Benutzer: {}", userEmail);
                } else {
                    logger.warn("Ungültiges JWT Token für Benutzer: {}", userEmail);
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                }
            }
        } catch (Exception e) {
            logger.error("Fehler bei der JWT Token Verarbeitung: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        }

        filterChain.doFilter(request, response);
    }
}