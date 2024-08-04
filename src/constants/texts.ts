const MESSAGES = {
  AUTH: {
    INVALID_CREDENTIALS: 'Invalid username or email',
    INVALID_PASSWORD: 'Invalid password',
    INVALID_REFRESH_TOKEN: 'Invalid refresh token',
    INVALID_ACCESS_TOKEN: 'Invalid access token',
    TOKEN_INVALIDATED_SUCCESSFULLY: 'Token invalidated successfully',
    USER_NOT_FOUND: 'User not found',
    VALIDATIONS: {
      USER_OR_EMAIL_NOT_EMPTY: 'Either username or email must be provided',
    },
  },
  USER: {
    USERNAME_ALREADY_EXISTS: 'Username already exists',
    EMAIL_EXISTS: 'Email already in use',
    USER_NOT_FOUND: 'User not found',
  },
  GENERIC: {
    ERROR_MESSAGE_COMPOSE: 'Error: ',
  },
  ERROR: {
    INTERNAL_SERVER_ERROR: 'Internal server error',
  },
};

export const TEXTS = {
  MESSAGES: MESSAGES,
};
