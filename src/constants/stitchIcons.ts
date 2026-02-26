import { ImageSourcePropType } from 'react-native'
import { StitchType } from '../types'

/** Mapping from StitchType to its chart symbol PNG asset. */
export const STITCH_ICON: Partial<Record<StitchType, ImageSourcePropType>> = {
  // ─── Crochet ─────────────────────────────────────────────────────────────────
  [StitchType.CHAIN]:         require('../../assets/crochet-chart-symbols/crochet-symbol-ch.png'),
  [StitchType.SLIP_STITCH]:   require('../../assets/crochet-chart-symbols/crochet-symbol-sl-st.png'),
  [StitchType.SINGLE]:        require('../../assets/crochet-chart-symbols/crochet-symbol-sc.png'),
  [StitchType.HALF_DOUBLE]:   require('../../assets/crochet-chart-symbols/crochet-symbol-hdc.png'),
  [StitchType.DOUBLE]:        require('../../assets/crochet-chart-symbols/crochet-symbol-dc.png'),
  [StitchType.TREBLE]:        require('../../assets/crochet-chart-symbols/crochet-symbol-tr.png'),
  [StitchType.SC2TOG]:        require('../../assets/crochet-chart-symbols/crochet-symbol-sc2tog.png'),
  [StitchType.DC2TOG]:        require('../../assets/crochet-chart-symbols/crochet-symbol-dc2tog.png'),
  [StitchType.DC3TOG]:        require('../../assets/crochet-chart-symbols/crochet-symbol-dc3tog.png'),
  [StitchType.DC3_CLUSTER]:   require('../../assets/crochet-chart-symbols/crochet-symbol-3-dc.png'),
  [StitchType.HDC3_CLUSTER]:  require('../../assets/crochet-chart-symbols/crochet-symbol-3-hdc.png'),
  [StitchType.DC5_POPCORN]:   require('../../assets/crochet-chart-symbols/crochet-symbol-5-dc.png'),
  [StitchType.DC5_SHELL]:     require('../../assets/crochet-chart-symbols/crochet-symbol-5-dc-shell.png'),
  // ─── Knitting ────────────────────────────────────────────────────────────────
  [StitchType.PURL]:          require('../../assets/knit-chart-symbols/knit-symbol-P-on-RS.png'),
  [StitchType.YARN_OVER]:     require('../../assets/knit-chart-symbols/knit-symbol-Yarn-over.png'),
  [StitchType.SLIP_WYIB]:     require('../../assets/knit-chart-symbols/knit-symbol-Sl-1-purlwise-wyb.png'),
  [StitchType.SLIP_WYIF]:     require('../../assets/knit-chart-symbols/knit-symbol-Sl-1-purlwise-wyf.png'),
  [StitchType.SSK]:           require('../../assets/knit-chart-symbols/knit-symbol-SSK-on-RS.png'),
  [StitchType.SSP]:           require('../../assets/knit-chart-symbols/knit-symbol-SSP-on-RS.png'),
  [StitchType.K2TOG]:         require('../../assets/knit-chart-symbols/knit-symbol-K2tog-on-RS.png'),
  [StitchType.P2TOG]:         require('../../assets/knit-chart-symbols/knit-symbol-P2tog-on-RS.png'),
  [StitchType.M1L]:           require('../../assets/knit-chart-symbols/knit-symbol-Left-slanting-make-1.png'),
  [StitchType.M1LP]:          require('../../assets/knit-chart-symbols/knit-symbol-M1-purlwise.png'),
  [StitchType.M1R]:           require('../../assets/knit-chart-symbols/knit-symbol-Right-slanting-make-1.png'),
  [StitchType.M1RP]:          require('../../assets/knit-chart-symbols/knit-symbol-M1-purlwise.png'),
  [StitchType.K_TBL]:         require('../../assets/knit-chart-symbols/knit-symbol-K1-tbl-on-RS.png'),
  [StitchType.P_TBL]:         require('../../assets/knit-chart-symbols/knit-symbol-P1-tbl-on-RS.png'),
}
