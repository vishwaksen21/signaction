self.__BUILD_MANIFEST = {
  "__rewrites": {
    "afterFiles": [],
    "beforeFiles": [
      {
        "source": "/translate-text"
      },
      {
        "source": "/translate-speech"
      },
      {
        "source": "/assets/:path*"
      },
      {
        "source": "/placeholder/:path*"
      },
      {
        "source": "/api/translate/:path*"
      },
      {
        "source": "/health"
      }
    ],
    "fallback": []
  },
  "sortedPages": [
    "/_app",
    "/_error"
  ]
};self.__BUILD_MANIFEST_CB && self.__BUILD_MANIFEST_CB()