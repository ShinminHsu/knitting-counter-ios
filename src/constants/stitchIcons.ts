import { ComponentType } from 'react'
import { SvgProps } from 'react-native-svg'
import { StitchType } from '../types'

// ─── Crochet (SVG) ────────────────────────────────────────────────────────────
import SvgChain       from '../../assets/crochet-symbols/svg/crochet-master_chain.svg'
import SvgSlst        from '../../assets/crochet-symbols/svg/crochet-master_slst.svg'
import SvgSc          from '../../assets/crochet-symbols/svg/crochet-master_sc.svg'
import SvgHdc         from '../../assets/crochet-symbols/svg/crochet-master_hdc.svg'
import SvgDc          from '../../assets/crochet-symbols/svg/crochet-master_dc.svg'
import SvgTr          from '../../assets/crochet-symbols/svg/crochet-master_tr.svg'
import SvgScInc       from '../../assets/crochet-symbols/svg/crochet-master_sc-inc.svg'
import SvgHdcInc      from '../../assets/crochet-symbols/svg/crochet-master_hdcinc.svg'
import SvgDcInc       from '../../assets/crochet-symbols/svg/crochet-master_dcinc.svg'
import SvgSc3inc      from '../../assets/crochet-symbols/svg/crochet-master_sc3inc.svg'
import SvgSc2tog      from '../../assets/crochet-symbols/svg/crochet-master_sc2tog.svg'
import SvgSc3tog      from '../../assets/crochet-symbols/svg/crochet-master_sc3tog.svg'
import SvgHdc2tog     from '../../assets/crochet-symbols/svg/crochet-master_hdc2tog.svg'
import SvgDc2tog      from '../../assets/crochet-symbols/svg/crochet-master_dc2tog.svg'
import SvgDc3tog      from '../../assets/crochet-symbols/svg/crochet-master_dc3tog.svg'
import SvgDc3Cluster  from '../../assets/crochet-symbols/svg/crochet-master_3dc-cluster.svg'
import SvgHdc3Cluster from '../../assets/crochet-symbols/svg/crochet-master_3hdc-cluster.svg'
import SvgDc5Popcorn  from '../../assets/crochet-symbols/svg/crochet-master_5dc-popcorn.svg'
import SvgDc5Shell    from '../../assets/crochet-symbols/svg/crochet-master_5dc-shell.svg'

export const CROCHET_SVG_MAP: Partial<Record<StitchType, ComponentType<SvgProps>>> = {
  [StitchType.CHAIN]:        SvgChain,
  [StitchType.SLIP_STITCH]:  SvgSlst,
  [StitchType.SINGLE]:       SvgSc,
  [StitchType.HALF_DOUBLE]:  SvgHdc,
  [StitchType.DOUBLE]:       SvgDc,
  [StitchType.TREBLE]:       SvgTr,
  [StitchType.SC_INC]:       SvgScInc,
  [StitchType.HDC_INC]:      SvgHdcInc,
  [StitchType.DC_INC]:       SvgDcInc,
  [StitchType.SC3INC]:       SvgSc3inc,
  [StitchType.SC2TOG]:       SvgSc2tog,
  [StitchType.SC3TOG]:       SvgSc3tog,
  [StitchType.HDC2TOG]:      SvgHdc2tog,
  [StitchType.DC2TOG]:       SvgDc2tog,
  [StitchType.DC3TOG]:       SvgDc3tog,
  [StitchType.DC3_CLUSTER]:  SvgDc3Cluster,
  [StitchType.HDC3_CLUSTER]: SvgHdc3Cluster,
  [StitchType.DC5_POPCORN]:  SvgDc5Popcorn,
  [StitchType.DC5_SHELL]:    SvgDc5Shell,
}

// ─── Knitting (SVG) ───────────────────────────────────────────────────────────
import SvgKnit from '../../assets/knit-chart-symbols/knit.svg'
import SvgPurl from '../../assets/knit-chart-symbols/purl.svg'
import SvgYarnOver from '../../assets/knit-chart-symbols/yarnover.svg'
import SvgSlipWyib from '../../assets/knit-chart-symbols/slip.svg'
import SvgSlipWyif from '../../assets/knit-chart-symbols/slipwyif.svg'
import SvgSsk from '../../assets/knit-chart-symbols/decreaseleft.svg'
import SvgSsp from '../../assets/knit-chart-symbols/decreaseleft_purl.svg'
import SvgK2tog from '../../assets/knit-chart-symbols/decreaseright.svg'
import SvgP2tog from '../../assets/knit-chart-symbols/decreaseright_purl.svg'
import SvgSssk from '../../assets/knit-chart-symbols/decreaseleft.2w.svg'
import SvgK3tog from '../../assets/knit-chart-symbols/decreaseright.2w.svg'
import SvgCdd from '../../assets/knit-chart-symbols/decrease3to1centered.svg'
import SvgM1l from '../../assets/knit-chart-symbols/slantleft.svg'
import SvgM1r from '../../assets/knit-chart-symbols/slantright.svg'
import SvgM1lp from '../../assets/knit-chart-symbols/twist_purl.svg'
import SvgM1rp from '../../assets/knit-chart-symbols/twist_purl.svg'
import SvgKtbl from '../../assets/knit-chart-symbols/twist.svg'
import SvgPtbl from '../../assets/knit-chart-symbols/twist_purl.svg'
import SvgCable11RC from '../../assets/knit-chart-symbols/crossright.svg'
import SvgCable11LC from '../../assets/knit-chart-symbols/crossleft.svg'
import SvgCable22RC from '../../assets/knit-chart-symbols/c2over2right.svg'
import SvgCable22LC from '../../assets/knit-chart-symbols/c2over2left.svg'
import SvgCable11RPC from '../../assets/knit-chart-symbols/crossright_purl.svg'
import SvgCable11LPC from '../../assets/knit-chart-symbols/crossleft_purl.svg'
import SvgCable22RPC from '../../assets/knit-chart-symbols/c2over2right-purl.svg'
import SvgCable22LPC from '../../assets/knit-chart-symbols/c2over2left-purl.svg'
import SvgBindOff from '../../assets/knit-chart-symbols/bindoff.svg'

export const KNIT_SVG_MAP: Partial<Record<StitchType, ComponentType<SvgProps>>> = {
  [StitchType.KNIT]:          SvgKnit,
  [StitchType.PURL]:          SvgPurl,
  [StitchType.YARN_OVER]:     SvgYarnOver,
  [StitchType.SLIP_WYIB]:     SvgSlipWyib,
  [StitchType.SLIP_WYIF]:     SvgSlipWyif,
  [StitchType.SSK]:           SvgSsk,
  [StitchType.SSP]:           SvgSsp,
  [StitchType.K2TOG]:         SvgK2tog,
  [StitchType.P2TOG]:         SvgP2tog,
  [StitchType.SSSK]:          SvgSssk,
  [StitchType.K3TOG]:         SvgK3tog,
  [StitchType.CDD]:           SvgCdd,
  [StitchType.M1L]:           SvgM1l,
  [StitchType.M1R]:           SvgM1r,
  [StitchType.M1LP]:          SvgM1lp,
  [StitchType.M1RP]:          SvgM1rp,
  [StitchType.K_TBL]:         SvgKtbl,
  [StitchType.P_TBL]:         SvgPtbl,
  [StitchType.CABLE_1_1_RC]:  SvgCable11RC,
  [StitchType.CABLE_1_1_LC]:  SvgCable11LC,
  [StitchType.CABLE_2_2_RC]:  SvgCable22RC,
  [StitchType.CABLE_2_2_LC]:  SvgCable22LC,
  [StitchType.CABLE_1_1_RPC]: SvgCable11RPC,
  [StitchType.CABLE_1_1_LPC]: SvgCable11LPC,
  [StitchType.CABLE_2_2_RPC]: SvgCable22RPC,
  [StitchType.CABLE_2_2_LPC]: SvgCable22LPC,
  [StitchType.BIND_OFF]:      SvgBindOff,
}
