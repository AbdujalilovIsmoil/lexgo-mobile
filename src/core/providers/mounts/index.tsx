import { AiMounts } from "./AiMounts";
import { AuthMounts } from "./AuthMounts";
import { InfraMounts } from "./InfraMounts";
import { MarketMounts } from "./MarketMounts";
import { MsgMounts } from "./MsgMounts";
import { PayMounts } from "./PayMounts";
import { RaMounts } from "./RaMounts";
import { ReqMounts } from "./ReqMounts";
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
      <MarketMounts />
      <ReqMounts />
      <RaMounts />
    </>
  );
}
