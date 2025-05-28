package rh.ptp.quizapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import rh.ptp.quizapp.model.User;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * Service zur Erstellung, Validierung und Analyse von JWT-Tokens.
 */
@Service
public class JwtService {

    @org.springframework.beans.factory.annotation.Value("${jwt.secret.key}")
    private String SECRET_KEY;
    /**
     * Standardmäßige Gültigkeitsdauer eines JWT-Tokens in Millisekunden.
     * Standardmäßig auf 24 Stunden gesetzt.
     */
    private static final long JWT_EXPIRATION = 1000 * 60 * 60 * 24;

    /**
     * Extrahiert den Benutzernamen (Subject) aus einem JWT-Token.
     *
     * @param token JWT-Token
     * @return Benutzername
     */
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Extrahiert einen beliebigen Claim aus dem Token mithilfe eines Claims-Resolvers.
     *
     * @param token          JWT-Token
     * @param claimsResolver Funktion zur Verarbeitung der Claims
     * @param <T>            Typ des Rückgabewerts
     * @return Extrahierter Wert
     */
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    /**
     * Erstellt ein JWT-Token für einen Benutzer ohne zusätzliche Claims.
     *
     * @param userDetails Benutzerdetails
     * @return JWT-Token
     */
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    /**
     * Erstellt ein JWT-Token mit zusätzlichen Claims.
     *
     * @param extraClaims Zusätzliche Informationen im Token
     * @param userDetails Benutzerdetails
     * @return JWT-Token
     */
    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    /**
     * Überprüft, ob ein JWT-Token gültig ist.
     *
     * @param token       JWT-Token
     * @param userDetails Benutzerdetails
     * @return true, wenn Token gültig ist
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    /**
     * Überprüft, ob das Token abgelaufen ist.
     *
     * @param token JWT-Token
     * @return true, wenn abgelaufen
     */
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    /**
     * Extrahiert das Ablaufdatum eines Tokens.
     *
     * @param token JWT-Token
     * @return Ablaufdatum
     */
    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    /**
     * Extrahiert alle Claims aus einem Token.
     *
     * @param token JWT-Token
     * @return Claims
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    /**
     * Gibt den geheimen Signierschlüssel zurück.
     *
     * @return Schlüssel für HMAC
     */
    private Key getSignInKey() {
        byte[] keyBytes = java.util.Base64.getDecoder().decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Erstellt ein Passwort-Zurücksetz-Token für einen Benutzer (1 Stunde gültig).
     *
     * @param user Benutzer
     * @return JWT-Token
     */
    public String generatePasswordResetToken(User user) {
        return generateToken(user, 3600000);
    }

    /**
     * Erstellt ein JWT-Token mit benutzerdefinierter Gültigkeitsdauer.
     *
     * @param user           Benutzer
     * @param expirationTime Gültigkeit in Millisekunden
     * @return JWT-Token
     */
    private String generateToken(User user, long expirationTime) {
        return generateToken(new HashMap<>(), user, expirationTime);
    }

    /**
     * Erstellt ein JWT-Token mit benutzerdefinierter Gültigkeit und zusätzlichen Claims.
     *
     * @param extraClaims    Zusätzliche Claims
     * @param user           Benutzer
     * @param expirationTime Gültigkeit in Millisekunden
     * @return JWT-Token
     */
    private String generateToken(Map<String, Object> extraClaims, User user, long expirationTime) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(user.getEmail())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }
}