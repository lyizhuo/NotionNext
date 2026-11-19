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

    // 顶部渐进模糊已经提供多层模糊，关掉导航自带的单层模糊避免叠加
    #theme-nobelium .sticky-nav{
        -webkit-backdrop-filter: none;
        backdrop-filter: none;
    }

    // 隐藏时保留 1% 透明度，让 7 层 backdrop-filter 常驻合成器；
    // 否则首次显示时要现场创建滤镜层，会出现约 100ms 的空白延迟
    #theme-nobelium .top-blur{
        opacity: 0.01;
        transition: opacity 0.15s cubic-bezier(0.4, 0, 0, 1);
    }

    #theme-nobelium .top-blur.top-blur-visible{
        opacity: 1;
    }

    // 吸顶后原来的 1px 分割线会截断模糊过渡，隐藏它
    #theme-nobelium .sticky-nav-full{
        border-bottom-color: transparent !important;
    }


      ${themeConsoleStyle('nobelium', CONFIG)}
  `}</style>
}

export { Style }
