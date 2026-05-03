import BLOG from '@/blog.config'
import { siteConfig } from '@/lib/config'
import { fetchGlobalAllData } from '@/lib/db/SiteDataApi'
import { extractLangId, extractLangPrefix } from '@/lib/utils/pageId'
import { Feed } from 'feed'

export const getServerSideProps = async ctx => {
  const siteIds = BLOG.NOTION_PAGE_ID.split(',')
  let allPosts = []
  let siteInfo = null
  let NOTION_CONFIG = null

  for (let index = 0; index < siteIds.length; index++) {
    const siteId = siteIds[index]
    const id = extractLangId(siteId)
    const locale = extractLangPrefix(siteId)

    const siteData = await fetchGlobalAllData({
      pageId: id,
      from: 'rss-feed'
    })

    if (index === 0) {
      siteInfo = siteData?.siteInfo
      NOTION_CONFIG = siteData?.NOTION_CONFIG
    }

    const posts =
      siteData?.allPages?.filter(
        p =>
          p?.slug &&
          !p.slug.startsWith('http') &&
          !p.slug.startsWith('#') &&
          (p.status === 'Published' || p.status === 'Invisible')
      ) ?? []
    allPosts = allPosts.concat(posts)
  }

  // Deduplicate by slug
  const seen = new Set()
  allPosts = allPosts.filter(p => {
    if (seen.has(p.slug)) return false
    seen.add(p.slug)
    return true
  })

  const LINK = siteConfig('LINK', siteInfo?.link, NOTION_CONFIG)
  const TITLE = siteInfo?.title || BLOG.TITLE
  const DESCRIPTION = siteInfo?.description || BLOG.DESCRIPTION
  const AUTHOR = siteConfig('AUTHOR', null, NOTION_CONFIG) || BLOG.AUTHOR
  const LANG = siteConfig('LANG', null, NOTION_CONFIG) || BLOG.LANG
  const CONTACT_EMAIL = siteConfig('CONTACT_EMAIL', null, NOTION_CONFIG) || ''

  const year = new Date().getFullYear()
  const feed = new Feed({
    title: TITLE,
    description: DESCRIPTION,
    link: LINK,
    language: LANG,
    favicon: `${LINK}/favicon.png`,
    copyright: `All rights reserved ${year}, ${AUTHOR}`,
    author: {
      name: AUTHOR,
      email: CONTACT_EMAIL,
      link: LINK
    }
  })

  for (const post of allPosts) {
    feed.addItem({
      title: post.title,
      link: `${LINK}/${post.slug}`,
      description: post.summary || '',
      date: new Date(post?.publishDay || Date.now())
    })
  }

  const xml = feed.rss2()

  ctx.res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  ctx.res.setHeader(
    'Cache-Control',
    'public, max-age=600, stale-while-revalidate=60'
  )
  ctx.res.write(xml)
  ctx.res.end()

  return { props: {} }
}

export default () => {}
