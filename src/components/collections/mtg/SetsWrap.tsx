import { mtgSets, type MtgSets } from '../../../pages/collections/mtg/sets/data'
import '../../../pages/collections/mtg/css/mtg.css'

type Props = {
  year: MtgSets['year']
}

export default function SetsWrap({ year }: Props) {
  const sets = mtgSets.filter(set => set.year === year)

  return (
    <div className='sets__wrap'>
      <h2 className='year__ttl'>{year}</h2>
      <div className='sets__inner'>
        {sets.map(set => (
          <a
            key={set.slug}
            href={`/collections/mtg/sets/${set.slug}/`}
            className='set__link'
          >
            <div className='set__thumb'>
              <img
                src={`/collections/mtg/sets/${set.logoUrl}`}
                alt={set.name}
                width='400'
                height='200'
                className='set__img'
              />
            </div>
            <p className='set__name'>{set.nameJa}</p>
          </a>
        ))}
      </div>
    </div>
  )
}