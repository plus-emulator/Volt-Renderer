export type PacketDirection = 'client_to_server' | 'server_to_client';
export type PacketSide = 'java' | 'typescript';
export type PacketOrigin = 'official' | 'custom';
export type PacketStability = 'stable' | 'experimental' | 'deprecated';
export type ScalarType = 'byte' | 'short' | 'int' | 'long' | 'boolean' | 'string' | 'bytes';

export interface ScalarSchema
{
    type: ScalarType;
    name: string;
}

export interface ListSchema
{
    type: 'list';
    countType: ScalarType;
    item: readonly WireSchema[];
}

export interface OptionalSchema
{
    type: 'optional';
    controller: string;
    fields: readonly WireSchema[];
}

export interface VariantSchema
{
    type: 'variant';
    discriminator: string;
    branches: Readonly<Record<string, readonly WireSchema[]>>;
}

export type WireSchema = ScalarSchema | ListSchema | OptionalSchema | VariantSchema;

export interface PacketEndpoint
{
    symbol: string;
    className: string;
    path: string;
}

export interface PacketContract
{
    name: string;
    direction: PacketDirection;
    header: number;
    java?: PacketEndpoint;
    csharp?: PacketEndpoint;
    typescript: PacketEndpoint;
    fields: readonly WireSchema[];
}

export interface UnpairedPacket
{
    direction: PacketDirection;
    side: PacketSide;
    header: number;
    symbol: string;
    path: string;
    reason: string;
}

export interface PacketExemption
{
    name: string;
    direction: PacketDirection;
    header: number;
    java?: PacketEndpoint;
    csharp?: PacketEndpoint;
    typescript: PacketEndpoint;
    reason: string;
}

export interface PacketMetadata
{
    range: string;
    origin: PacketOrigin;
    feature: string;
    stability: PacketStability;
}

export interface PacketRegistryDefaults
{
    origin: PacketOrigin;
    stability: PacketStability;
}

export interface PacketHeaderRange
{
    name: string;
    direction: PacketDirection;
    start: number;
    end: number;
    origin: PacketOrigin;
    feature: string;
    stability: PacketStability;
}

export interface PacketAlias
{
    side: PacketSide;
    direction: PacketDirection;
    header: number;
    canonical: string;
    aliases: readonly string[];
    reason: string;
}

export interface UnsupportedPacket
{
    side: PacketSide;
    direction: PacketDirection;
    symbol: string;
    reason: string;
}

export interface PacketRegistryPolicy
{
    defaults: PacketRegistryDefaults;
    ranges: readonly PacketHeaderRange[];
    aliases: readonly PacketAlias[];
    unsupported: readonly UnsupportedPacket[];
    metadataFor(direction: PacketDirection, header: number): PacketMetadata;
}

export interface PacketContractManifest
{
    schemaVersion: 2;
    nativeAir?: NativeAirRegistry;
    registry: PacketRegistryPolicy;
    contracts: readonly PacketContract[];
    unpaired: readonly UnpairedPacket[];
    exemptions: readonly PacketExemption[];
}

export interface NativeAirIdentity
{
    direction: PacketDirection;
    header: number;
    sourceClass: string;
    sourcePath: string;
    sourceSha256: string;
    mapLine: number;
    reportedName: string | null;
    namingSource: 'Sulek' | null;
    canonicalName: string | null;
    canonicalStatus: 'semantic-verified' | 'unknown';
    localBindings: { csharp: readonly string[]; typescript: readonly string[] };
}

export interface NativeAirRegistry
{
    build: string;
    swfSha256: string;
    messageMapSha256: string;
    auditSha256: string;
    namingScope: string;
    semanticScope: string;
    packets: readonly NativeAirIdentity[];
    identityFor(direction: PacketDirection, header: number): NativeAirIdentity | undefined;
}
