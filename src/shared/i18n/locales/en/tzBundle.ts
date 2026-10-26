import { tzNav } from "./tzNav";
import { tzFnd } from "./tzFnd";
import { tzAu } from "./tzAu";
import { tzCl } from "./tzCl";
import { tzMs } from "./tzMs";
import { tzAx } from "./tzAx";
import { tzSp } from "./tzSp";
import { tzDc } from "./tzDc";
import { tzDm } from "./tzDm";
import { tzAd } from "./tzAd";
import { tzAw } from "./tzAw";
import { tzSl } from "./tzSl";
import { tzMk } from "./tzMk";
import { tzUg } from "./tzUg";
import { tzPy } from "./tzPy";
import { tzNt } from "./tzNt";
import { ccs } from "./ccs";
import { tzCx } from "./tzCx";
import { cpA } from "./cpA";
import { cpC } from "./cpC";
import { cpD } from "./cpD";
import { tzCsv } from "./tzCsv";
import { tgp } from "./tgp";
import { so1 } from "./so1";
import { dcat } from "./dcat";
import { dcf } from "./dcf";
import { dcl } from "./dcl";
import { mf } from "./mf";

// Namespaces pre-registered per work package (see TZ_STATUS.md for owners).
export const tzBundle = {
  ...tzNav, ...tzFnd, ...tzAu, ...tzCl, ...tzMs,
  ...tzAx, ...tzSp, ...tzDc, ...tzDm, ...tzAd,
  ...tzAw, ...tzSl, ...tzMk, ...tzUg, ...tzPy, ...tzNt, ccs, ...tzCx,
  ...cpA, ...cpC, ...cpD, ...tzCsv, ...tgp, ...so1, ...dcat, ...dcf, ...dcl, ...mf,
};
