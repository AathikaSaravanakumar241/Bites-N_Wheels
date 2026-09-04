package com.food.bitesonwheels.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String SECRET =
            "bites-n-wheels-secret-key-must-be-32-chars!!";

    private static final long EXPIRY_MS =
            24 * 60 * 60 * 1000;

    private SecretKey getKey() {
        return Keys.hmacShaKeyFor(
                SECRET.getBytes(StandardCharsets.UTF_8)
        );
    }
    public String generateToken(UserDetails user) {

        return Jwts.builder()
                .subject(user.getUsername())
                .issuedAt(new Date())
                .expiration(
                        new Date(System.currentTimeMillis() + EXPIRY_MS)
                )
                .signWith(getKey())
                .compact();
    }

    // Extract email/username from JWT
    public String getEmailFromToken(String token) {

        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Validate JWT token
    public boolean isTokenValid(
            String token,
            UserDetails user
    ) {

        try {

            String email = getEmailFromToken(token);

            return email.equals(user.getUsername());

        } catch (Exception e) {

            return false;
        }
    }
}