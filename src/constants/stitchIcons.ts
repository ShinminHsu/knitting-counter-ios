import { ImageSourcePropType } from 'react-native'
import { ComponentType } from 'react'
import { SvgProps } from 'react-native-svg'
import { StitchType } from '../types'

// ─── Crochet (PNG) ────────────────────────────────────────────────────────────
export const CROCHET_PNG_MAP: Partial<Record<StitchType, ImageSourcePropType>> = {
  [StitchType.CHAIN]:        require('../../assets/crochet-chart-symbols/32px-Crochet_chain.png'),
  [StitchType.SLIP_STITCH]:  require('../../assets/crochet-chart-symbols/8px-Slst-crochet-symbols.png'),
  [StitchType.SINGLE]:       require('../../assets/crochet-chart-symbols/32px-Crochet_single_crochet.png'),
  [StitchType.HALF_DOUBLE]:  require('../../assets/crochet-chart-symbols/32px-Crochet_half_double_crochet.png'),
  [StitchType.DOUBLE]:       require('../../assets/crochet-chart-symbols/32px-Crochet_double_crochet.png'),
  [StitchType.TREBLE]:       require('../../assets/crochet-chart-symbols/32px-Crochet_double_triple.png'),
  [StitchType.SC_INC]:       require('../../assets/crochet-chart-symbols/32px-Crochet_single_crochet.png'),
  [StitchType.HDC_INC]:      require('../../assets/crochet-chart-symbols/16px-Hdc-crochet-symbols.png'),
  [StitchType.DC_INC]:       require('../../assets/crochet-chart-symbols/32px-Crochet_inc1dc.png'),
  [StitchType.SC2TOG]:       require('../../assets/crochet-chart-symbols/16px-Sc2tog-crochet-symbols.png'),
  [StitchType.HDC2TOG]:      require('../../assets/crochet-chart-symbols/32px-Hdc2tog-crochet-symbols.png'),
  [StitchType.HDC3TOG]:      require('../../assets/crochet-chart-symbols/32px-Hdg3tog-crochet-symbols.png'),
  [StitchType.DC2TOG]:       require('../../assets/crochet-chart-symbols/32px-Crochet_dc2tog.png'),
  [StitchType.DC3TOG]:       require('../../assets/crochet-chart-symbols/32px-Crochet_dc3tog.png'),
  [StitchType.DC3_CLUSTER]:  require('../../assets/crochet-chart-symbols/32px-Dc3sh-crochet-symbols.png'),
  [StitchType.HDC3_CLUSTER]: require('../../assets/crochet-chart-symbols/32px-Hdc3sh-crochet-symbols.png'),
  [StitchType.DC5_POPCORN]:  require('../../assets/crochet-chart-symbols/32px-Crochet_popcorn.png'),
  [StitchType.DC5_SHELL]:    require('../../assets/crochet-chart-symbols/32px-Dc4sh-crochet-symbols.png'),
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
