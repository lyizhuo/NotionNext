// 顶部边缘从强到弱分成 7 个模糊层。每层只承担一段“方差增量”，
// 叠加后的总方差等于该位置的目标模糊半径，避免顶部附近叠出更大的模糊
const BLUR_LAYERS = 7
const MAX_BLUR = 8

/** 生成带缓动的 mask 过渡，避免线性 stop 在端点留下折线 */
const smoothRamp = (from, to, fromAlpha, toAlpha, steps = 4) =>
  Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps
    const eased = (1 - Math.cos(Math.PI * t)) / 2
    const alpha = fromAlpha + (toAlpha - fromAlpha) * eased
    const pos = from + (to - from) * t
    return `rgb(0 0 0 / ${alpha.toFixed(3)}) ${pos.toFixed(2)}%`
  })

// 渲染顺序从弱到强，最强层最后绘制。每层的 sigma 按
// sqrt(to² - from²) 取值，使叠加后的总模糊正好落在 to
const blurLayers = Array.from({ length: BLUR_LAYERS }, (_, index) => {
  const level = index + 1
  const from = (MAX_BLUR * (level - 1)) / BLUR_LAYERS
  const to = (MAX_BLUR * level) / BLUR_LAYERS
  const sigma = Math.sqrt(to * to - from * from)
  const fullUntil = 100 * (1 - to / MAX_BLUR)
  const fadeUntil = 100 * (1 - from / MAX_BLUR)
  const stops = ['rgb(0 0 0) 0%']

  if (fullUntil > 0) {
    stops.push(`rgb(0 0 0) ${fullUntil.toFixed(2)}%`)
  }
  stops.push(...smoothRamp(fullUntil, fadeUntil, 1, 0))

  return {
    blur: sigma,
    mask: `linear-gradient(to bottom, ${stops.join(', ')})`
  }
})

/**
 * 顶部渐进模糊层，不参与布局；需要时放在 fixed 导航下方
 * 只用 backdrop-filter，不再叠加白色/黑色遮罩色块
 * @param {object} blurRef 由 Nav 控制显隐，和导航宽度动画同步切换
 */
const TopBlur = ({ blurRef }) => (
  <div
    ref={blurRef}
    aria-hidden
    className='top-blur pointer-events-none fixed inset-x-0 top-0 z-[9] h-20 overflow-hidden md:h-24'
  >
    {blurLayers.map((layer, index) => (
      <div
        key={index}
        // 向左右溢出，避免 Safari 在 backdrop blur 结束处画出硬边
        className='absolute inset-y-0 -inset-x-8'
        style={{
          zIndex: index + 1,
          backdropFilter: `blur(${layer.blur.toFixed(2)}px)`,
          WebkitBackdropFilter: `blur(${layer.blur.toFixed(2)}px)`,
          maskImage: layer.mask,
          WebkitMaskImage: layer.mask
        }}
      />
    ))}
  </div>
)

export default TopBlur
