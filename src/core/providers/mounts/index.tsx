import { AiMounts } from "./AiMounts";
import { AuthMounts } from "./AuthMounts";
import { CcMounts } from "./CcMounts";
import { InfraMounts } from "./InfraMounts";
import { MarketMounts } from "./MarketMounts";
import { MsgMounts } from "./MsgMounts";
import { PayMounts } from "./PayMounts";
import { SupMounts } from "./SupMounts";
import { UrgMounts } from "./UrgMounts";

// One component per work package so packages never edit the same provider file.
export function PackageMounts() {
  return (
    <>
      <InfraMounts />
      <AuthMounts />
      <MsgMounts />
      <AiMounts />
      <PayMounts />
      <SupMounts />
      <UrgMounts />
      <CcMounts />
      <MarketMounts />
    </>
  );
}
