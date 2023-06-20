# `@metamask/core-signer-example-snap`

This snap demonstrates how a snap can be called from other snaps, using the
`wallet_invokeSnap` JSON-RPC method, to perform any kind of operation. For this
particular example, we use the `wallet_invokeSnap` method to request an account
from the core signer snap, and use it to sign a message.

The private key never leaves the core signer snap: The other snap only receives
a public key and signature.

## Snap usage

This snap exposes an `onRpcRequest` handler, which supports the following
JSON-RPC methods:

- `getAccount`: Get an account (public key) from the core signer snap. The
  account is derived from the entropy generated by the core signer snap, using
  the specified `path`.
- `signMessage`: Sign a `message` using the private key derived from the entropy
  generated by the core signer snap, using the specified `path`. The message is
  expected to be a hexadecimal string.