package com.ehub.notification.service;

import lombok.RequiredArgsConstructor;
import com.ehub.notification.util.MessageKeys;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.security.SecureRandom;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${app.otp.rate-limit.item-limit}")
    private int itemLimit;

    @Value("${app.otp.rate-limit.time-limit-minutes}")
    private int timeLimitMinutes;

    public String generateOtp(String email) {
        String limitKey = "OTP_LIMIT:" + email;
        
        // 1. Increment and get the count atomically
        Long count = redisTemplate.opsForValue().increment(limitKey);
        
        // 2. If it's the first request, set the expiration
        if (count != null && count == 1) {
            redisTemplate.expire(limitKey, timeLimitMinutes, TimeUnit.MINUTES);
        }

        // 3. Check against the limit
        if (count != null && count > itemLimit) {
            throw new RuntimeException(String.format(MessageKeys.RATE_LIMIT_EXCEEDED.getMessage(), timeLimitMinutes));
        }

        // 4. Generate and store the actual OTP
        String otp = String.format("%06d", secureRandom.nextInt(1000000));
        redisTemplate.opsForValue().set("OTP:" + email, otp, 5, TimeUnit.MINUTES);
        
        return otp;
    }

    public boolean validateOtp(String email, String otp) {
        String storedOtp = redisTemplate.opsForValue().get("OTP:" + email);
        if (storedOtp != null && storedOtp.equals(otp)) {
            redisTemplate.delete("OTP:" + email);
            return true;
        }
        return false;
    }
}
