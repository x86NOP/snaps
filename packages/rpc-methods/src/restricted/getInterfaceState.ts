import {
  PermissionSpecificationBuilder,
  PermissionType,
  RestrictedMethodOptions,
  SubjectType,
  ValidPermissionSpecification,
} from '@metamask/permission-controller';
import { ComponentState } from '@metamask/snaps-utils';
import { NonEmptyArray } from '@metamask/utils';
import { ethErrors } from 'eth-rpc-errors';
import { MethodHooksObject } from 'src/utils';
import { StructError, create, object, string } from 'superstruct';

const methodName = 'snap_getInterfaceState';

export type GetInterfaceStateArgs = {
  id: string;
};

type GetInterfaceState = (
  snapId: string,
  id: string,
) => Promise<ComponentState>;

export type GetInterfaceStateMethodHooks = {
  /**
   * @param snapId - The ID of the Snap that is showing the interface.
   * @param id - The ID of the interface to update.
   */
  getInterfaceState: GetInterfaceState;
};

type GetInterfaceStateSpecificationBuilderOptions = {
  allowedCaveats?: Readonly<NonEmptyArray<string>> | null;
  methodHooks: GetInterfaceStateMethodHooks;
};

type GetInterfaceStateSpecification = ValidPermissionSpecification<{
  permissionType: PermissionType.RestrictedMethod;
  targetName: typeof methodName;
  methodImplementation: ReturnType<typeof getGetInterfaceStateImplementation>;
  allowedCaveats: Readonly<NonEmptyArray<string>> | null;
}>;

/**
 * The specification builder for the `snap_getInterfaceState` permission. `snap_getInterfaceState`
 * lets the Snap resolve a UI inteface made of snaps UI components.
 *
 * @param options - The specification builder options.
 * @param options.allowedCaveats - The optional allowed caveats for the
 * permission.
 * @param options.methodHooks - The RPC method hooks needed by the method
 * implementation.
 * @returns The specification of the `snap_getInterfaceState` permission.
 */

const specificationBuilder: PermissionSpecificationBuilder<
  PermissionType.RestrictedMethod,
  GetInterfaceStateSpecificationBuilderOptions,
  GetInterfaceStateSpecification
> = ({
  allowedCaveats = null,
  methodHooks,
}: GetInterfaceStateSpecificationBuilderOptions) => {
  return {
    permissionType: PermissionType.RestrictedMethod,
    targetName: methodName,
    allowedCaveats,
    methodImplementation: getGetInterfaceStateImplementation(methodHooks),
    subjectTypes: [SubjectType.Snap],
  };
};

const methodHooks: MethodHooksObject<GetInterfaceStateMethodHooks> = {
  getInterfaceState: true,
};

export const getInterfaceStateBuilder = Object.freeze({
  targetName: methodName,
  specificationBuilder,
  methodHooks,
});

const paramsStruct = object({
  id: string(),
});

/**
 * Builds the method implementation for `snap_getInterfaceState`.
 *
 * @param hooks - The RPC method hooks.
 * @param hooks.getInterfaceState - A function that resolves the specified interface in the
 * MetaMask UI.
 * @returns The method implementation which return nothing.
 */
export function getGetInterfaceStateImplementation({
  getInterfaceState,
}: GetInterfaceStateMethodHooks) {
  return async function implementation(
    args: RestrictedMethodOptions<GetInterfaceStateArgs>,
  ): Promise<ComponentState> {
    const {
      params,
      context: { origin },
    } = args;

    const validatedParams = getValidatedParams(params);

    const { id } = validatedParams;

    return await getInterfaceState(origin, id);
  };
}

/**
 * Validates the getInterfaceState method `params` and returns them cast to the correct
 * type. Throws if validation fails.
 *
 * @param params - The unvalidated params object from the method request.
 * @returns The validated getInterfaceState method parameter object.
 */
function getValidatedParams(params: unknown): GetInterfaceStateArgs {
  try {
    return create(params, paramsStruct);
  } catch (error) {
    if (error instanceof StructError) {
      throw ethErrors.rpc.invalidParams({
        message: `Invalid params: ${error.message}.`,
      });
    }
    /* istanbul ignore next */
    throw ethErrors.rpc.internal();
  }
}
