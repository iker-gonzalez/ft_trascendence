export const swaggerConstants = {
  auth: {
    signin: {
      summary:
        'Sign in user through 42 Intra API. Receives a 42 Intra code as input. Retrieves user data from 42 Intra API and creates a new user in the database if needed.',
      ok: {
        description:
          'Returns user data from database. Either existing or new user.',
      },
      bad: {
        description: 'State value does not match or provided code is invalid.',
      },
      unauthorized: {
        description: 'OTP code is invalid.',
      },
    },
  },
  twofa: {
    generate: {
      summary: 'Generate QR code for 2FA. It can be used to add authenticator.',
      ok: {
        description: 'Returns QR code to add authenticator.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
    },
    activate: {
      summary: 'Activate 2FA on user profile. Receives OTP code as input.',
      ok: {
        description: 'Returns updated user data.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired or OTP code is invalid.',
      },
      bad: {
        description: 'OTP code is invalid.',
      },
    },
  },
  users: {
    me: {
      summary: 'Retrieve current user data from database.',
      ok: {
        description: 'Returns user data from database.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
    },
    username: {
      summary: 'Update username.',
      ok: {
        description: 'Returns updated user data.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
      bad: {
        description:
          'Username is not valid or provided id does not match current user.',
      },
    },
    avatar: {
      summary:
        'Update avatar. Receives file as input. Avatar is then stored in the server storage and its URL is stored in the database.',
      ok: {
        description: 'Returns updated user data.',
      },
      unauthorized: {
        description: 'JWT token is invalid or expired.',
      },
      bad: {
        description:
          'File is not valid, e.g. not provided, not image, too small or too big.',
      },
    },
  },
  game: {
    sessions: {
      new: {
        summary: 'Create  new game session.',
        created: {
          description: 'Returns newly created game session.',
        },
        bad: {
          description: 'Data is not valid.',
        },
      },
    },
  },
  dto: {
    intraSignin: {
      code: {
        description: 'Code provided by 42 Intra API',
        example:
          '2347e735860cd289bcefb543fe19238d25ed32255b02d566104c2c8d6a150689',
      },
      state: {
        description: 'State value required by 42 Intra API to prevent CSRF',
        example: 'aC1b4gdseU1ka4VFhYLJqFSEWu1ZFk9A',
      },
      otpCode: {
        description: 'OTP code provided by Authenticator',
        example: '123456',
      },
    },
    intraUserSignin: {
      intraId: {
        description: 'User ID from 42 Intra API',
        example: 12345,
      },
      username: {
        description: 'Username from 42 Intra API',
        example: 'jdoe',
      },
      email: {
        description: 'Email from 42 Intra API',
        example: 'jdoe@student.42urduliz.com',
      },
      avatar: {
        description: 'Avatar URL from 42 Intra API',
        example: 'https://cdn.intra.42.fr/users/jdoe.jpg',
      },
    },
    activateOtp: {
      otpCode: {
        description: 'OTP code provided by Authenticator',
        example: '123456',
      },
    },
    activateOtpResponse: {
      updated: {
        description: 'Number of updated resources',
        example: 1,
      },
    },
    signinResponse: {
      created: {
        description: 'Number of created resources',
        example: 1,
      },
      access_token: {
        description: 'JWT token',
        example:
          'eyJzdWIiOiJjYzAyNGVmMi1mYjc5LTQwMGMtOGY5Ny1jZTBlNDlkN2RjNjgiLCJpYXQiOjE2ODg5MDkwMDEsImV4cCI6MTY4ODkxMDgwMX0',
      },
      data: {
        description: 'User data from database',
      },
    },
    twoFactorSecret: {
      secret: {
        description: 'Secret key for 2FA',
        example: 'JBSWY3DPEHPK3PXP',
      },
      otpauthUrl: {
        description: 'URL to add authenticator',
        example:
          'otpauth://totp/2FA%20Example:jdoe%40student.42urduliz.com?secret=JBSWY3DPEHPK3PXP&issuer=2FA%20Example',
      },
    },
    updateName: {
      updated: {
        description: 'Number of updated resources',
        example: 1,
      },
      data: {
        description: 'Updated user data',
      },
    },
    userDto: {
      id: {
        description: 'User ID',
        example: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
      },
      createdAt: {
        description: 'Profile creation date',
        example: new Date(Date.now() - 86400000),
      },
      updatedAt: {
        description: 'Profile last update date',
        example: new Date(),
      },
      twoFactorAuthSecret: {
        description: 'User 2FA secret',
        example: 'JBSWY3DPEHPK3PXP',
      },
      isTwoFactorAuthEnabled: {
        description: 'User 2FA enabled',
        example: true,
      },
    },
    avatarDto: {
      avatar: {
        description: 'File uploaded by user.',
        example: 'avatar.jpg',
      },
    },
    newSessionResponseDto: {
      created: {
        description: 'Number of created sessions',
        example: 1,
      },
      data: {
        description: 'Session data',
      },
    },
    newSessionDto: {
      ball: {
        description: 'Stringified ball data',
        example:
          '{"x":5,"y":5,"radius":10,"velocityX":5,"velocityY":5,"speed":20,"color":"WHITE","reset":false}',
      },
      player1: {
        description: 'Player 1 data',
        example:
          '{"x":30,"y":100,"width":10,"height":100,"score":0,"color":"WHITE"}',
      },
      player2: {
        description: 'Player 2 data',
        example:
          '{"x":560,"y":100,"width":10,"height":100,"score":0,"color":"WHITE"}',
      },
    },
    newPlayerDto: {
      id: {
        description: 'Player ID',
        example: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
      },
    },
    sessionResponseDto: {
      id: {
        description: 'Session ID',
        example: 'c024ef2-fb79-400c-8f97-ce0e49d7dc68',
      },
      players: {
        description: 'Players data',
        example: [
          {
            index: 0,
            x: 5,
            y: 5,
            radius: 10,
            velocityX: 5,
            velocityY: 5,
            speed: 20,
            color: 'WHITE',
            reset: false,
          },
          {
            index: 1,
            x: 560,
            y: 100,
            width: 10,
            height: 100,
            score: 0,
            color: 'WHITE',
          },
        ],
      },
      ball: {
        description: 'Ball data',
        example: {
          x: 5,
          y: 5,
          radius: 10,
          velocityX: 5,
          velocityY: 5,
          speed: 20,
          color: 'WHITE',
          reset: false,
        },
      },
    },
  },
};
