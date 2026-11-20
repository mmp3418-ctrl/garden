import type { ServiceRow, SiteSettings } from '../types'

/** Official residential-complex copy used for restore / seed actions. */
export const OFFICIAL_TEXT = {
  hero_title_ar: 'وصف المرافق الترفيهية والخدمات المتوفرة بالمجمع السكني',
  hero_title_en:
    'Description of Recreational Facilities and Available Services in the Residential Complex',
  hero_subtitle_ar:
    'يستفيد المجمع من وجود حوالي أربعة مداخل، وطرق داخلية مرصوفة، وإنارة للشوارع في جميع أنحاء العقار. كما تتوفر مواقف للسيارات تستوعب حوالي 16 سيارة.',
  hero_subtitle_en:
    'The complex benefits from approximately four entrances, paved internal roads, and street lighting throughout the property. Parking spaces accommodating around 16 cars are also available.',
  main_heading_ar: 'وصف المرافق الترفيهية والخدمات المتوفرة بالمجمع السكني',
  main_heading_en:
    'Description of Recreational Facilities and Available Services in the Residential Complex',
  complex_overview_ar:
    'يستفيد المجمع من وجود حوالي أربعة مداخل، وطرق داخلية مرصوفة، وإنارة للشوارع في جميع أنحاء العقار. كما تتوفر مواقف للسيارات تستوعب حوالي 16 سيارة.',
  complex_overview_en:
    'The complex benefits from approximately four entrances, paved internal roads, and street lighting throughout the property. Parking spaces accommodating around 16 cars are also available.',
  facilities_heading_ar: '4. المرافق الترفيهية والرياضية',
  facilities_heading_en: '4. Recreational and Sports Facilities',
  facilities_intro_ar:
    'يوفر المجمع مجموعة واسعة من المرافق الترفيهية والخدمات المخصصة للراحة والاستجمام، وتشمل:',
  facilities_intro_en:
    'The complex offers a wide range of recreational facilities and services dedicated to relaxation and leisure, including:',
} as const

export type OfficialTextKey = keyof typeof OFFICIAL_TEXT

export const officialSettingsDefaults: SiteSettings = {
  id: 1,
  ...OFFICIAL_TEXT,
  about_ar: OFFICIAL_TEXT.complex_overview_ar,
  about_en: OFFICIAL_TEXT.complex_overview_en,
  vision_ar: OFFICIAL_TEXT.facilities_heading_ar,
  vision_en: OFFICIAL_TEXT.facilities_heading_en,
  mission_ar: OFFICIAL_TEXT.facilities_intro_ar,
  mission_en: OFFICIAL_TEXT.facilities_intro_en,
  phone: '+218 21 480 2432',
  whatsapp: '+218 21 480 2432',
  email: 'info@garden-city.com.ly',
  address_ar: 'طريق المطار، سيدي صليم، طرابلس - ليبيا',
  address_en: 'Airport St., Sedy Slem, Tripoli - Libya',
  map_url: 'https://maps.google.com/?q=32.794930,13.134346',
  hero_image_url: null,
  updated_at: new Date().toISOString(),
}

export const OFFICIAL_FACILITIES: Array<
  Omit<ServiceRow, 'id' | 'created_at' | 'image_url'> & { image_url?: null }
> = [
  {
    title_ar: 'حوضا سباحة',
    title_en: 'Two Swimming Pools',
    description_ar:
      'حوض سباحة صغير مناسب للأطفال، وحوض سباحة آخر بحجم يقارب الحجم الأولمبي.',
    description_en:
      'A small swimming pool suitable for children, and another swimming pool with a size close to Olympic dimensions.',
    icon_name: 'Waves',
    image_url: null,
    sort_order: 1,
  },
  {
    title_ar: 'جلسات بجانب المسبح ومنطقة للشواء (BBQ)',
    title_en: 'Poolside Seating and BBQ Area',
    description_ar:
      'تحيط بمنطقة أحواض السباحة شرفة واسعة للجلسات، مع منطقة شواء مظللة محاطة بأشجار النخيل.',
    description_en:
      'A spacious seating terrace surrounds the swimming pool area, featuring a shaded barbecue (BBQ) area surrounded by palm trees.',
    icon_name: 'Flame',
    image_url: null,
    sort_order: 2,
  },
  {
    title_ar: 'كافتيريا',
    title_en: 'Cafeteria',
    description_ar:
      'تقع على ارتفاع أربع درجات فوق مستوى منطقة المسبح، وتتميز بوجود شرفة واسعة.',
    description_en:
      'Located four steps above the pool area level, featuring a spacious terrace.',
    icon_name: 'Coffee',
    image_url: null,
    sort_order: 3,
  },
  {
    title_ar: 'مرافق تغيير الملابس والحمامات',
    title_en: 'Changing Facilities and Restrooms',
    description_ar: 'يوجد حمامان لخدمة المنطقة الترفيهية.',
    description_en: 'There are two restrooms serving the recreational area.',
    icon_name: 'Bath',
    image_url: null,
    sort_order: 4,
  },
]
