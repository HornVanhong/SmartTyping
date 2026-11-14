package com.typemaster.common.error;

import java.util.List;

public record ErrorResponse(
        String type,
        String title,
        int status,
        String detail,
        String instance,
        String code,
        String traceId,
        List<FieldErrorItem> fieldErrors
) {
    public ErrorResponse(String type, String title, int status, String detail, String instance, String code, String traceId) {
        this(type, title, status, detail, instance, code, traceId, List.of());
    }
}
