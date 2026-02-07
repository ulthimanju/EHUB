package com.ehub.event.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class CommonClient {

    private final RestTemplate restTemplate;

    @Value("${application.common-service.url}")
    private String baseUrl;

    public String getUuid() {
        return restTemplate.getForObject(baseUrl + "/uuid", String.class);
    }
}
