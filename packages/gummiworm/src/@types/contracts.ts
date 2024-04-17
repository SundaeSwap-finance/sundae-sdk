import { Data } from "lucid-cardano";

export const VKeyCredentialSchema = Data.Object({
  VKeyCredential: Data.Object({ bytes: Data.Bytes() }),
});
export type TVKeyCredential = Data.Static<typeof VKeyCredentialSchema>;
export const VKeyCredential =
  VKeyCredentialSchema as unknown as TVKeyCredential;

export const SCredentialSchema = Data.Object({
  SCredential: Data.Object({ bytes: Data.Bytes() }),
});
export type TSCredential = Data.Static<typeof SCredentialSchema>;
export const SCredential = SCredentialSchema as unknown as TSCredential;

export const CredentialSchema = Data.Enum([
  VKeyCredentialSchema,
  SCredentialSchema,
]);
export type TCredential = Data.Static<typeof CredentialSchema>;
export const Credential = CredentialSchema as unknown as TCredential;

export const AddressSchema = Data.Object({
  paymentCredential: CredentialSchema,
  stakeCredential: Data.Nullable(
    Data.Object({
      keyHash: CredentialSchema,
    })
  ),
});

export const DatumSchema = Data.Enum([
  Data.Literal("NoDatum"),
  Data.Object({ DatumHash: Data.Tuple([Data.Bytes()]) }),
  Data.Object({ InlineDatum: Data.Tuple([Data.Any()]) }),
]);

export const DestinationSchema = Data.Object({
  address: AddressSchema,
  datum: DatumSchema,
});
export type TDestinationDatum = Data.Static<typeof DestinationSchema>;
export const DestinationDatum =
  DestinationSchema as unknown as TDestinationDatum;
