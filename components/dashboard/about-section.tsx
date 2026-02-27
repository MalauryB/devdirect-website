"use client"

import { Globe, Smartphone, Cpu, Palette, PenTool, Video, FileCheck, HeartHandshake } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

export function AboutSection() {
  const { t } = useLanguage()

  return (
    <div className="w-full">
      <h2 className="text-xl font-bold text-[#38392c] mb-2">{t('dashboard.about.title')}</h2>
      <p className="text-[#7f7074] mb-8">{t('dashboard.about.intro')}</p>

      {/* Why choose us */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-[#38392c] mb-4">{t('dashboard.about.whyUs')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
            <div className="w-10 h-10 bg-[#ba9fdf] rounded-lg flex items-center justify-center mb-3">
              <Video className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.features.freeMeeting.title')}</h4>
            <p className="text-sm text-[#7f7074]">{t('dashboard.about.features.freeMeeting.description')}</p>
          </div>
          <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
            <div className="w-10 h-10 bg-[#6cb1bb] rounded-lg flex items-center justify-center mb-3">
              <FileCheck className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.features.transparentQuote.title')}</h4>
            <p className="text-sm text-[#7f7074]">{t('dashboard.about.features.transparentQuote.description')}</p>
          </div>
          <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
            <div className="w-10 h-10 bg-[#ea4c89] rounded-lg flex items-center justify-center mb-3">
              <HeartHandshake className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.features.fullSupport.title')}</h4>
            <p className="text-sm text-[#7f7074]">{t('dashboard.about.features.fullSupport.description')}</p>
          </div>
        </div>
      </div>

      {/* Services */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-[#38392c] mb-4">{t('dashboard.about.servicesTitle')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
            <div className="w-10 h-10 bg-[#6cb1bb] rounded-lg flex items-center justify-center mb-3">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.services.web.title')}</h4>
            <p className="text-sm text-[#7f7074]">{t('dashboard.about.services.web.description')}</p>
          </div>
          <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
            <div className="w-10 h-10 bg-[#ba9fdf] rounded-lg flex items-center justify-center mb-3">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.services.mobile.title')}</h4>
            <p className="text-sm text-[#7f7074]">{t('dashboard.about.services.mobile.description')}</p>
          </div>
          <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
            <div className="w-10 h-10 bg-[#9c984d] rounded-lg flex items-center justify-center mb-3">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.services.iot.title')}</h4>
            <p className="text-sm text-[#7f7074]">{t('dashboard.about.services.iot.description')}</p>
          </div>
          <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
            <div className="w-10 h-10 bg-[#ea4c89] rounded-lg flex items-center justify-center mb-3">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.services.ai.title')}</h4>
            <p className="text-sm text-[#7f7074]">{t('dashboard.about.services.ai.description')}</p>
          </div>
          <div className="bg-white border border-[#d0d1d9] rounded-xl p-5">
            <div className="w-10 h-10 bg-[#7f7074] rounded-lg flex items-center justify-center mb-3">
              <PenTool className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-[#38392c] mb-1">{t('dashboard.about.services.design.title')}</h4>
            <p className="text-sm text-[#7f7074]">{t('dashboard.about.services.design.description')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
