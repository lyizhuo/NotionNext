/* eslint-disable react/no-unknown-property */
import CONFIG from './config'
import { themeConsoleStyle } from '@/lib/themeConsoleStyle'
/**
 * 此处样式只对当前主题生效
 * 此处不支持tailwindCSS的 @apply 语法
 * @returns
 */
const Style = () => {
  return <style jsx global>{`

    // 深色模式底色
    .dark #theme-nobelium{
        background-color: rgb(24 24 27) !important;
    }

    // 顶部渐进模糊可见时才关掉导航自身的单层模糊；
    // 隐藏态或异常情况下保留它作为兜底
    #theme-nobelium .top-blur-visible ~ .sticky-nav{
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
    }

    // backdrop-filter 不能靠父级 opacity 淡入：父级 opacity < 1 会形成
    // backdrop root，模糊会直接消失，直到父级 opacity 回到 1。
    // 因此逐层淡入；隐藏态保留 1% 让滤镜层常驻，避免首次显示时再创建。
    #theme-nobelium .top-blur-layer{
        opacity: 0.01;
        transition: opacity 0.15s cubic-bezier(0.4, 0, 0, 1);
    }

    #theme-nobelium .top-blur-visible .top-blur-layer{
        opacity: 1;
    }

    @media (prefers-reduced-transparency: reduce){
        #theme-nobelium .top-blur-layer{
            display: none;
        }
        #theme-nobelium .top-blur-visible ~ .sticky-nav{
            -webkit-backdrop-filter: blur(5px);
            backdrop-filter: blur(5px);
        }
    }

    // 吸顶后原来的 1px 分割线会截断模糊过渡，隐藏它
    #theme-nobelium .sticky-nav-full{
        border-bottom-color: transparent !important;
    }


      ${themeConsoleStyle('nobelium', CONFIG)}
  `}</style>
}

export { Style }
