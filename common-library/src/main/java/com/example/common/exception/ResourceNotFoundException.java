package com.example.common.exception;

public class ResourceNotFoundException extends BaseApplicationException {
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(
            String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue),
            "RESOURCE_NOT_FOUND"
        );
    }
}
