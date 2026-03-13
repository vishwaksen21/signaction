class SignActionError(Exception):
    """Base exception for this project."""


class SpeechToTextError(SignActionError):
    pass


class ModelNotConfiguredError(SpeechToTextError):
    pass
