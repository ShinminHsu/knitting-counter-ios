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
import SvgCh3Picot    from '../../assets/crochet-symbols/svg/crochet-master_ch3-picot.svg'
import SvgDtr         from '../../assets/crochet-symbols/svg/crochet-master_dtr.svg'
import SvgScInc       from '../../assets/crochet-symbols/svg/crochet-master_sc-inc.svg'
import SvgHdcInc      from '../../assets/crochet-symbols/svg/crochet-master_hdcinc.svg'
import SvgHdc3Inc     from '../../assets/crochet-symbols/svg/crochet-master_3hdc-inc.svg'
import SvgDcInc       from '../../assets/crochet-symbols/svg/crochet-master_dcinc.svg'
import SvgDc3Inc      from '../../assets/crochet-symbols/svg/crochet-master_3dc-inc.svg'
import SvgSc3inc      from '../../assets/crochet-symbols/svg/crochet-master_sc3inc.svg'
import SvgSc2tog      from '../../assets/crochet-symbols/svg/crochet-master_sc2tog.svg'
import SvgSc3tog      from '../../assets/crochet-symbols/svg/crochet-master_sc3tog.svg'
import SvgHdc2tog     from '../../assets/crochet-symbols/svg/crochet-master_hdc2tog.svg'
import SvgHdc3tog     from '../../assets/crochet-symbols/svg/crochet-master_hdc3tog.svg'
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
  [StitchType.CH3_PICOT]:    SvgCh3Picot,
  [StitchType.DTR]:          SvgDtr,
  [StitchType.SC_INC]:       SvgScInc,
  [StitchType.SC3INC]:       SvgSc3inc,
  [StitchType.HDC_INC]:      SvgHdcInc,
  [StitchType.HDC3_INC]:     SvgHdc3Inc,
  [StitchType.DC_INC]:       SvgDcInc,
  [StitchType.DC3_INC]:      SvgDc3Inc,
  [StitchType.SC2TOG]:       SvgSc2tog,
  [StitchType.SC3TOG]:       SvgSc3tog,
  [StitchType.HDC2TOG]:      SvgHdc2tog,
  [StitchType.HDC3TOG]:      SvgHdc3tog,
  [StitchType.DC2TOG]:       SvgDc2tog,
  [StitchType.DC3TOG]:       SvgDc3tog,
  [StitchType.DC3_CLUSTER]:  SvgDc3Cluster,
  [StitchType.HDC3_CLUSTER]: SvgHdc3Cluster,
  [StitchType.DC5_POPCORN]:  SvgDc5Popcorn,
  [StitchType.DC5_SHELL]:    SvgDc5Shell,
}

// ─── Knitting (SVG) ───────────────────────────────────────────────────────────
import SvgKnit          from '../../assets/knit-symbols/knit-master_knit.svg'
import SvgPurl          from '../../assets/knit-symbols/knit-master_purl.svg'
import SvgYarnOver      from '../../assets/knit-symbols/knit-master_yo.svg'
import SvgSlipWyib      from '../../assets/knit-symbols/knit-master_sl1-wyib.svg'
import SvgSlipWyif      from '../../assets/knit-symbols/knit-master_sl1-wyif.svg'
import SvgBackwardLoopCo from '../../assets/knit-symbols/knit-master_backward-loop-co.svg'
import SvgKtbl          from '../../assets/knit-symbols/knit-master_k1-tbl.svg'
import SvgPtbl          from '../../assets/knit-symbols/knit-master_pl-tbl.svg'
import SvgK2tog         from '../../assets/knit-symbols/knit-master_k2tog.svg'
import SvgP2tog         from '../../assets/knit-symbols/knit-master_p2tog.svg'
import SvgSsk           from '../../assets/knit-symbols/knit-master_ssk.svg'
import SvgSsp           from '../../assets/knit-symbols/knit-master_ssp.svg'
import SvgK3tog         from '../../assets/knit-symbols/knit-master_k3tog.svg'
import SvgP3tog         from '../../assets/knit-symbols/knit-master_p3tog.svg'
import SvgSssk          from '../../assets/knit-symbols/knit-master_sssk.svg'
import SvgSssp          from '../../assets/knit-symbols/knit-master_sssp.svg'
import SvgS2kp2         from '../../assets/knit-symbols/knit-master_s2kp2.svg'
import SvgSspp2         from '../../assets/knit-symbols/knit-master_sspp2.svg'
import SvgLli           from '../../assets/knit-symbols/knit-master_lli.svg'
import SvgLlpi          from '../../assets/knit-symbols/knit-master_llpi.svg'
import SvgRli           from '../../assets/knit-symbols/knit-master_rli.svg'
import SvgRlpi          from '../../assets/knit-symbols/knit-master_rlpi.svg'
import SvgCable2stRC    from '../../assets/knit-symbols/knit-master_2st-RC.svg'
import SvgCable2stLC    from '../../assets/knit-symbols/knit-master_2st-LC.svg'
import SvgCable2stRPC   from '../../assets/knit-symbols/knit-master_2st-RPC.svg'
import SvgCable2stLPC   from '../../assets/knit-symbols/knit-master_2st-LPC.svg'

export const KNIT_SVG_MAP: Partial<Record<StitchType, ComponentType<SvgProps>>> = {
  [StitchType.KNIT]:           SvgKnit,
  [StitchType.PURL]:           SvgPurl,
  [StitchType.YARN_OVER]:      SvgYarnOver,
  [StitchType.SLIP_WYIB]:      SvgSlipWyib,
  [StitchType.SLIP_WYIF]:      SvgSlipWyif,
  [StitchType.BACKWARD_LOOP_CO]: SvgBackwardLoopCo,
  [StitchType.K_TBL]:          SvgKtbl,
  [StitchType.P_TBL]:          SvgPtbl,
  [StitchType.K2TOG]:          SvgK2tog,
  [StitchType.P2TOG]:          SvgP2tog,
  [StitchType.SSK]:            SvgSsk,
  [StitchType.SSP]:            SvgSsp,
  [StitchType.K3TOG]:          SvgK3tog,
  [StitchType.P3TOG]:          SvgP3tog,
  [StitchType.SSSK]:           SvgSssk,
  [StitchType.SSSP]:           SvgSssp,
  [StitchType.S2KP2]:          SvgS2kp2,
  [StitchType.SSPP2]:          SvgSspp2,
  [StitchType.LLI]:            SvgLli,
  [StitchType.LLPI]:           SvgLlpi,
  [StitchType.RLI]:            SvgRli,
  [StitchType.RLPI]:           SvgRlpi,
  [StitchType.CABLE_2ST_RC]:   SvgCable2stRC,
  [StitchType.CABLE_2ST_LC]:   SvgCable2stLC,
  [StitchType.CABLE_2ST_RPC]:  SvgCable2stRPC,
  [StitchType.CABLE_2ST_LPC]:  SvgCable2stLPC,
}
