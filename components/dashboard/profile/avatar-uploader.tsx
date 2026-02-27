"use client"

import { User, Loader2, Camera } from "lucide-react"
import { useLanguage } from "@/contexts/language-context"

interface AvatarUploaderProps {
  avatarUrl: string
  uploading: boolean
  disabled: boolean
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function AvatarUploader({ avatarUrl, uploading, disabled, onUpload }: AvatarUploaderProps) {
  const { t } = useLanguage()

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">{t('profile.avatar')}</h3>
      <div className="flex items-center gap-6">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-border flex-shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover min-w-full min-h-full"
                style={{ objectPosition: 'center' }}
              />
            ) : (
              <User className="w-10 h-10 text-muted-foreground" />
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
            {uploading ? (
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
              <Camera className="w-4 h-4 text-white" />
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={onUpload}
              disabled={uploading || disabled}
              className="hidden"
            />
          </label>
        </div>
        <div>
          <p className="text-sm text-foreground/70">{t('profile.avatarDesc')}</p>
          <p className="text-xs text-foreground/50 mt-1">PNG, JPG, GIF (max 2MB)</p>
        </div>
      </div>
    </div>
  )
}
