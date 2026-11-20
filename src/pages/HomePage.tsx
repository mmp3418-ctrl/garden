import { Building2, Camera, Mail, MapPin, Phone } from 'lucide-react'
import type { FC } from 'react'
import Footer from '../components/Footer'
import Navbar from '../components/Navbar'
import ServiceIcon from '../components/ServiceIcon'
import { SiteDataProvider, useSite } from '../context/SiteDataContext'
import { useLanguage } from '../context/LanguageContext'
import { BRAND_NAME } from '../data/content'
import { useFavicon } from '../hooks/useFavicon'
import { toMapEmbedUrl } from '../utils/map'
import { pickLocale, toTelHref } from '../utils/locale'

const HomeContent: FC = () => {
  const { language } = useLanguage()
  const { settings, services, gallery } = useSite()
  useFavicon(settings.logo_url)

  const heroTitle = pickLocale(language, settings.hero_title_ar, settings.hero_title_en)
  const heroSubtitle = pickLocale(language, settings.hero_subtitle_ar, settings.hero_subtitle_en)
  const mainHeading = pickLocale(language, settings.main_heading_ar, settings.main_heading_en)
  const overview = pickLocale(language, settings.complex_overview_ar, settings.complex_overview_en)
  const facilitiesHeading = pickLocale(
    language,
    settings.facilities_heading_ar,
    settings.facilities_heading_en,
  )
  const facilitiesIntro = pickLocale(
    language,
    settings.facilities_intro_ar,
    settings.facilities_intro_en,
  )
  const address = pickLocale(language, settings.address_ar, settings.address_en)
  const phone = settings.phone?.trim() || ''
  const email = settings.email?.trim() || 'info@garden-city.com.ly'
  const heroImage = settings.hero_image_url?.trim() || null
  const galleryItems = gallery.filter((item) => item.image_url?.trim())

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-page text-primary">
      <Navbar />
      <main>
        <section id="home" className="relative flex min-h-dvh items-end pb-16 pt-28 md:items-center md:pb-24">
          <div className="absolute inset-0 bg-navy" />
          {heroImage ? (
            <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(0,169,255,0.32),transparent_42%),linear-gradient(145deg,#07111D,#0B192C_50%,#102038)]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B192C]/45 via-[#0B192C]/55 to-[#0B192C]/92" />
          <div className="relative container-site w-full">
            <p className="mb-3 font-display text-sm font-semibold text-cyan" dir="ltr">
              {BRAND_NAME}
            </p>
            <h1 className="max-w-4xl text-3xl font-extrabold text-white sm:text-5xl">{heroTitle}</h1>
            <p className="mt-5 max-w-2xl text-sm leading-8 text-white/80 sm:text-base">{heroSubtitle}</p>
          </div>
        </section>

        <section id="about" className="section-pad">
          <div className="container-site">
            <article className="glass-card mx-auto max-w-4xl rounded-2xl p-6 sm:p-8">
              <div className="mb-4 inline-flex rounded-xl bg-brand-gradient p-2.5 text-white">
                <Building2 size={18} />
              </div>
              <p className="mb-2 font-display text-sm font-semibold text-cyan" dir="ltr">
                {BRAND_NAME}
              </p>
              <h2 className="text-2xl font-extrabold sm:text-3xl">{mainHeading}</h2>
              <p className="mt-4 text-sm leading-8 text-[var(--text-secondary)] sm:text-base">{overview}</p>
            </article>
          </div>
        </section>

        <section id="services" className="section-pad bg-[var(--bg-elevated)]/55">
          <div className="container-site">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-extrabold sm:text-3xl">{facilitiesHeading}</h2>
              <p className="mt-3 text-sm leading-8 text-[var(--text-secondary)]">{facilitiesIntro}</p>
            </div>
            <ul className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
              {services.map((service, index) => (
                <li key={service.id} className="glass-card rounded-2xl p-5 sm:p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="inline-flex rounded-xl bg-brand-gradient p-3 text-white">
                      <ServiceIcon name={service.icon_name} />
                    </div>
                    <span className="text-sm font-bold text-cyan">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-bold">
                    {pickLocale(language, service.title_ar, service.title_en)}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">
                    {pickLocale(language, service.description_ar, service.description_en)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="gallery" className="section-pad">
          <div className="container-site">
            <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
              {language === 'ar' ? 'معرض الصور' : 'Gallery'}
            </h2>
            <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(galleryItems.length > 0
                ? galleryItems.map((item) => ({ key: item.id, src: item.image_url }))
                : Array.from({ length: 3 }, (_, index) => ({ key: `empty-${index}`, src: null as string | null }))
              ).map((item) => (
                <li
                  key={item.key}
                  className="aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
                >
                  {item.src ? (
                    <img src={item.src} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Camera className="text-cyan/70" size={28} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="contact" className="section-pad">
          <div className="container-site space-y-6">
            <h2 className="text-center text-2xl font-extrabold sm:text-3xl">
              {language === 'ar' ? 'تواصل معنا' : 'Contact'}
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="glass-card rounded-2xl p-5">
                <MapPin className="mb-3 text-cyan" size={18} />
                <p className="text-sm font-semibold">{address}</p>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <Phone className="mb-3 text-cyan" size={18} />
                <a href={toTelHref(phone)} className="text-sm font-semibold hover:text-cyan" dir="ltr">
                  {phone}
                </a>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <Mail className="mb-3 text-cyan" size={18} />
                <a href={`mailto:${email}`} className="break-all text-sm font-semibold hover:text-cyan" dir="ltr">
                  {email}
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-[var(--glass-border)]">
              <div className="relative aspect-[16/10] bg-[var(--bg-deep)]">
                <iframe
                  title="Map"
                  src={toMapEmbedUrl(settings.map_url)}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

const HomePage: FC = () => (
  <SiteDataProvider>
    <HomeContent />
  </SiteDataProvider>
)

export default HomePage
