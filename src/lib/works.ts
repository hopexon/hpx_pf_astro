import { works } from '../pages/works/data'

type Work = (typeof works)[number]

export interface WorkImage {
  imgBaseName: string
  alt: string
  width: string
  height: string
}

export interface WorkGroup {
  title: string
  date: string
  venue: string
  images: WorkImage[]
}

const toImage = ({ imgBaseName, alt, width, height }: Work): WorkImage => ({
  imgBaseName,
  alt,
  width,
  height,
})

/** /works ページ内の各作品のアンカー ID (TOP などから /works#work-01 で直接飛べる) */
export const workAnchorId = (index: number): string =>
  `work-${String(index + 1).padStart(2, '0')}`

/**
 * data.ts では「title が空の項目 = 直前の作品の続きの画像」として並んでいる。
 * それを作品単位 (1作品に画像が1枚以上) にまとめ直す。
 */
export const groupWorks = (): WorkGroup[] => {
  const groups: WorkGroup[] = []

  for (const work of works) {
    const last = groups.at(-1)

    if (work.title === '' && last) {
      last.images.push(toImage(work))
      continue
    }

    groups.push({
      title: work.title,
      date: work.date,
      venue: work.venue,
      images: [toImage(work)],
    })
  }

  return groups
}
