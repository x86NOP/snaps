import { PermissionType, SubjectType } from '@metamask/permission-controller';

import { getImplementation, specificationBuilder } from './getLocale';

describe('wallet_getLocale', () => {
  describe('specification', () => {
    it('builds specification', () => {
      const methodHooks = {
        getLocale: jest.fn(),
      };

      expect(
        specificationBuilder({
          methodHooks,
        }),
      ).toStrictEqual({
        allowedCaveats: null,
        methodImplementation: expect.anything(),
        permissionType: PermissionType.RestrictedMethod,
        targetName: 'wallet_getLocale',
        subjectTypes: [SubjectType.Snap],
      });
    });
  });

  describe('getImplementation', () => {
    it('returns the locale', async () => {
      const methodHooks = {
        getLocale: jest.fn().mockResolvedValue('en'),
      };

      const implementation = getImplementation(methodHooks);

      expect(
        await implementation({
          context: {
            origin: 'npm:@metamask/example-snap',
          },
          method: 'wallet_getLocale',
        }),
      ).toBe('en');
    });
  });
});
