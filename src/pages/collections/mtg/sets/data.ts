export type MtgSets = {
  name: string
  nameJa: string
  year: number | string
  code: string
  slug: string
  logoUrl: string
}

export const mtgSets: MtgSets[] = [
  {
    name: 'Secret Lair',
    nameJa: 'Secret Lair',
    year : '-',
    code: 'SLD',
    slug: 'secret-lair',
    logoUrl: 'logo_secret_lair.avif',
  },
  {
    name: 'Secrets of Strixhaven',
    nameJa: 'ストリクスヘイヴンの秘密',
    year : 2026,
    code: 'SOS',
    slug: 'secrets-of-strixhaven',
    logoUrl: 'logo_secrets_of_strixhaven.avif',
  },
  {
    name: 'Tarkir Dragonstorm',
    nameJa: 'タルキール：龍嵐録',
    year : 2025,
    code: 'TDM',
    slug: 'tarkir-dragonstorm',
    logoUrl: 'logo_tarkir_dragonstorm.avif',
  },
  {
    name: 'March of the Machine',
    nameJa: '機械兵団の進軍',
    year : 2023,
    code: 'MOM',
    slug: 'march-of-the-machine',
    logoUrl: 'logo_march_of_the_machine.avif',
  },
  {
    name: 'Phyrexia: All Will Be One',
    nameJa: 'ファイレクシア：完全なる統一',
    year : 2023,
    code: 'ONE',
    slug: 'phyrexia-all-will-be-one',
    logoUrl: 'logo_phyrexia_all_will_be_one.avif',
  },
  {
    name: 'Zendikar Rising',
    nameJa: 'ゼンディカーの夜明け',
    year : 2020,
    code: 'ZNR',
    slug: 'zendikar-rising',
    logoUrl: 'logo_zendikar_rising.avif',
  },
  {
    name: 'Iconic Masters',
    nameJa: 'アイコニック・マスターズ',
    year : 2017,
    code: 'IMA',
    slug: 'iconic-masters',
    logoUrl: 'logo_iconic_masters.avif',
  },
]

export const mtgMap = new Map<string, MtgSets>(
  mtgSets.map(set => [set.slug, set])
)

export const mtgSetYears = [...new Set(mtgSets.map(set => set.year))]