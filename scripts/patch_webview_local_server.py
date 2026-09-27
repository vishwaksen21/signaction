#!/usr/bin/env python3
"""Patch Capacitor Android WebViewLocalServer.java for robust HTML5 video Range requests."""

import os
from pathlib import Path

TARGET = Path(__file__).resolve().parents[1] / "frontend" / "node_modules" / "@capacitor" / "android" / "capacitor" / "src" / "main" / "java" / "com" / "getcapacitor" / "WebViewLocalServer.java"

if not TARGET.exists():
    print(f"File not found: {TARGET}")
    exit(0)

content = TARGET.read_text(encoding="utf-8")

if "class BoundedInputStream" in content and "toSkip" in content:
    print("WebViewLocalServer.java is already patched with BoundedInputStream.")
    exit(0)

# Replace the broken Range handling block
ORIGINAL_RANGE_BLOCK = """        if (rangeString != null) {
            InputStream responseStream = new LollipopLazyInputStream(handler, request);
            String mimeType = getMimeType(path, responseStream);
            Map<String, String> tempResponseHeaders = handler.buildDefaultResponseHeaders();
            int statusCode = 206;
            try {
                int totalRange = responseStream.available();
                String[] parts = rangeString.split("=");
                String[] streamParts = parts[1].split("-");
                String fromRange = streamParts[0];
                int range = totalRange - 1;
                if (streamParts.length > 1) {
                    range = Integer.parseInt(streamParts[1]);
                }
                tempResponseHeaders.put("Accept-Ranges", "bytes");
                tempResponseHeaders.put("Content-Range", "bytes " + fromRange + "-" + range + "/" + totalRange);
            } catch (IOException e) {
                statusCode = 404;
            }
            return new WebResourceResponse(
                mimeType,
                handler.getEncoding(),
                statusCode,
                handler.getReasonPhrase(),
                tempResponseHeaders,
                responseStream
            );
        }"""

FIXED_RANGE_BLOCK = """        if (rangeString != null) {
            InputStream responseStream = new LollipopLazyInputStream(handler, request);
            int totalRange = -1;
            try {
                totalRange = responseStream.available();
            } catch (IOException e) {
                totalRange = -1;
            }

            // If resource is missing or empty, return 404 Not Found
            if (totalRange <= 0) {
                return new WebResourceResponse(
                    "text/plain",
                    handler.getEncoding(),
                    404,
                    "Not Found",
                    handler.buildDefaultResponseHeaders(),
                    null
                );
            }

            String mimeType = getMimeType(path, responseStream);
            Map<String, String> tempResponseHeaders = handler.buildDefaultResponseHeaders();
            int statusCode = 206;
            InputStream resultStream = responseStream;

            try {
                String[] parts = rangeString.split("=");
                if (parts.length > 1) {
                    String[] streamParts = parts[1].split("-");
                    long fromRange = Long.parseLong(streamParts[0].trim());
                    long range = totalRange - 1;
                    if (streamParts.length > 1 && !streamParts[1].trim().isEmpty()) {
                        range = Long.parseLong(streamParts[1].trim());
                    }
                    if (range >= totalRange) {
                        range = totalRange - 1;
                    }

                    if (fromRange > range || fromRange >= totalRange) {
                        tempResponseHeaders.put("Content-Range", "bytes */" + totalRange);
                        return new WebResourceResponse(
                            mimeType,
                            handler.getEncoding(),
                            416,
                            "Range Not Satisfiable",
                            tempResponseHeaders,
                            null
                        );
                    }

                    long contentLength = range - fromRange + 1;

                    // Skip stream to fromRange offset
                    long toSkip = fromRange;
                    while (toSkip > 0) {
                        long skipped = responseStream.skip(toSkip);
                        if (skipped <= 0) {
                            if (responseStream.read() == -1) break;
                            skipped = 1;
                        }
                        toSkip -= skipped;
                    }

                    // Wrap stream so it yields exactly contentLength bytes
                    resultStream = new BoundedInputStream(responseStream, contentLength);

                    tempResponseHeaders.put("Accept-Ranges", "bytes");
                    tempResponseHeaders.put("Content-Range", "bytes " + fromRange + "-" + range + "/" + totalRange);
                    tempResponseHeaders.put("Content-Length", String.valueOf(contentLength));
                    if (mimeType != null) {
                        tempResponseHeaders.put("Content-Type", mimeType);
                    }
                }
            } catch (Exception e) {
                statusCode = 404;
                resultStream = null;
            }

            return new WebResourceResponse(
                mimeType,
                handler.getEncoding(),
                statusCode,
                handler.getReasonPhrase(),
                tempResponseHeaders,
                resultStream
            );
        }"""

ORIGINAL_GET_BLOCK = """            String mimeType = getMimeType(path, responseStream);
            int statusCode = getStatusCode(responseStream, handler.getStatusCode());
            return new WebResourceResponse(
                mimeType,
                handler.getEncoding(),
                statusCode,
                handler.getReasonPhrase(),
                handler.buildDefaultResponseHeaders(),
                responseStream
            );"""

FIXED_GET_BLOCK = """            String mimeType = getMimeType(path, responseStream);
            int statusCode = getStatusCode(responseStream, handler.getStatusCode());
            Map<String, String> defaultHeaders = handler.buildDefaultResponseHeaders();
            if (statusCode == 200 && (ext.equals(".mp4") || ext.equals(".webm"))) {
                defaultHeaders.put("Accept-Ranges", "bytes");
                try {
                    int avail = responseStream.available();
                    if (avail > 0) {
                        defaultHeaders.put("Content-Length", String.valueOf(avail));
                    }
                } catch (Exception ignored) {}
            }
            return new WebResourceResponse(
                mimeType,
                handler.getEncoding(),
                statusCode,
                handler.getReasonPhrase(),
                defaultHeaders,
                responseStream
            );"""

BOUNDED_STREAM_CLASS = """    private static class BoundedInputStream extends InputStream {
        private final InputStream in;
        private long remaining;

        public BoundedInputStream(InputStream in, long limit) {
            this.in = in;
            this.remaining = limit;
        }

        @Override
        public int read() throws IOException {
            if (remaining <= 0) {
                return -1;
            }
            int res = in.read();
            if (res != -1) {
                remaining--;
            }
            return res;
        }

        @Override
        public int read(byte[] b, int off, int len) throws IOException {
            if (remaining <= 0) {
                return -1;
            }
            int toRead = (int) Math.min(len, remaining);
            int numRead = in.read(b, off, toRead);
            if (numRead != -1) {
                remaining -= numRead;
            }
            return numRead;
        }

        @Override
        public int available() throws IOException {
            return (int) Math.min(in.available(), remaining);
        }

        @Override
        public void close() throws IOException {
            in.close();
        }
    }

    public String getBasePath() {"""

modified = False
if ORIGINAL_RANGE_BLOCK in content:
    content = content.replace(ORIGINAL_RANGE_BLOCK, FIXED_RANGE_BLOCK)
    modified = True

if ORIGINAL_GET_BLOCK in content:
    content = content.replace(ORIGINAL_GET_BLOCK, FIXED_GET_BLOCK)
    modified = True

if "class BoundedInputStream" not in content and "    public String getBasePath() {" in content:
    content = content.replace("    public String getBasePath() {", BOUNDED_STREAM_CLASS)
    modified = True

if modified:
    TARGET.write_text(content, encoding="utf-8")
    print("Successfully patched WebViewLocalServer.java")
else:
    print("No changes needed or blocks not matched.")
