import type { Language } from '../types'

export interface AdminDictionary {
  brand: string
  loginTitle: string
  loginSubtitle: string
  username: string
  password: string
  showPassword: string
  hidePassword: string
  signIn: string
  signingIn: string
  logout: string
  invalidCredentials: string
  dashboard: string
  tabs: {
    site: string
    services: string
    gallery: string
    contact: string
    inbox: string
  }
  stats: {
    facilities: string
    gallery: string
    unread: string
    updated: string
  }
  save: string
  saveAll: string
  saving: string
  saved: string
  error: string
  loading: string
  upload: string
  uploading: string
  remove: string
  add: string
  edit: string
  delete: string
  cancel: string
  confirmDelete: string
  reorderUp: string
  reorderDown: string
  markRead: string
  markUnread: string
  noMessages: string
  noGallery: string
  heroPreview: string
  heroImage: string
  bilingualHint: string
  dropHint: string
  filterAll: string
  filterUnread: string
  securityTitle: string
  securityHint: string
  newUsername: string
  newPassword: string
  confirmPassword: string
  updateCredentials: string
  credentialsUpdated: string
  passwordMismatch: string
  mapPreview: string
  livePreview: string
  hidePreview: string
  showPreview: string
  unsaved: string
  restoreDefault: string
  restored: string
  seedFacilities: string
  seeded: string
  inlineEdit: string
  openEditor: string
  searchMessages: string
  selected: string
  bulkDelete: string
  previewLangAr: string
  previewLangEn: string
  sectionHero: string
  sectionOverview: string
  sectionFacilities: string
  chars: string
  dragHandle: string
  websiteLogo: string
  logoHint: string
  removeLogo: string
  logoDarkPreview: string
  logoLightPreview: string
  logoUploading: string
  logoUrlLabel: string
  logoUrlPlaceholder: string
  logoUrlHint: string
  applyLogoUrl: string
}

const ar: AdminDictionary = {
  brand: 'Garden City L.L.C',
  loginTitle: 'دخول لوحة التحكم',
  loginSubtitle: 'إدارة محتوى الموقع والوسائط',
  username: 'اسم المستخدم',
  password: 'كلمة المرور',
  showPassword: 'إظهار',
  hidePassword: 'إخفاء',
  signIn: 'تسجيل الدخول',
  signingIn: 'جارٍ الدخول...',
  logout: 'تسجيل الخروج',
  invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة',
  dashboard: 'لوحة التحكم',
  tabs: {
    site: 'التعريف والخلفية',
    services: 'المرافق والخدمات',
    gallery: 'معرض الصور',
    contact: 'وسائل التواصل والخريطة',
    inbox: 'الرسائل وإعدادات الدخول',
  },
  stats: {
    facilities: 'إجمالي المرافق',
    gallery: 'صور المعرض',
    unread: 'رسائل غير مقروءة',
    updated: 'آخر تحديث',
  },
  save: 'حفظ',
  saveAll: 'حفظ التغييرات',
  saving: 'جارٍ الحفظ...',
  saved: 'تم الحفظ بنجاح',
  error: 'حدث خطأ، حاول مرة أخرى',
  loading: 'جارٍ التحميل...',
  upload: 'رفع صورة',
  uploading: 'جارٍ الرفع...',
  remove: 'إزالة',
  add: 'إضافة',
  edit: 'تعديل',
  delete: 'حذف',
  cancel: 'إلغاء',
  confirmDelete: 'هل أنت متأكد من الحذف؟',
  reorderUp: 'أعلى',
  reorderDown: 'أسفل',
  markRead: 'تعيين كمقروء',
  markUnread: 'تعيين كغير مقروء',
  noMessages: 'لا توجد رسائل حالياً',
  noGallery: 'لا توجد صور في المعرض',
  heroPreview: 'معاينة خلفية الهيرو',
  heroImage: 'صورة خلفية الهيرو',
  bilingualHint: 'عربي / English',
  dropHint: 'اسحب الصور وأفلتها هنا، أو اختر ملفات للرفع',
  filterAll: 'الكل',
  filterUnread: 'غير مقروء',
  securityTitle: 'تغيير بيانات الدخول',
  securityHint: 'تحديث اسم المستخدم وكلمة المرور للوحة التحكم',
  newUsername: 'اسم المستخدم الجديد',
  newPassword: 'كلمة المرور الجديدة',
  confirmPassword: 'تأكيد كلمة المرور',
  updateCredentials: 'تحديث بيانات الدخول',
  credentialsUpdated: 'تم تحديث بيانات الدخول بنجاح',
  passwordMismatch: 'كلمتا المرور غير متطابقتين',
  mapPreview: 'معاينة الخريطة',
  livePreview: 'معاينة حية',
  hidePreview: 'إخفاء المعاينة',
  showPreview: 'إظهار المعاينة',
  unsaved: 'تغييرات غير محفوظة',
  restoreDefault: 'استعادة النص الافتراضي المعتمد',
  restored: 'تمت استعادة النص الافتراضي',
  seedFacilities: 'تعبئة المرافق الأربعة المعتمدة',
  seeded: 'تمت تعبئة المرافق الافتراضية',
  inlineEdit: 'تعديل سريع',
  openEditor: 'فتح المحرر',
  searchMessages: 'بحث في الرسائل...',
  selected: 'محدد',
  bulkDelete: 'حذف المحدد',
  previewLangAr: 'عربي',
  previewLangEn: 'English',
  sectionHero: 'الهيرو',
  sectionOverview: 'نظرة عامة على المجمع',
  sectionFacilities: 'المرافق الترفيهية',
  chars: 'حرف',
  dragHandle: 'سحب لإعادة الترتيب',
  websiteLogo: 'شعار الموقع',
  logoHint: 'PNG, JPG, JPEG, WebP, SVG — اسحب وأفلت أو اختر ملفاً',
  removeLogo: 'حذف الشعار',
  logoDarkPreview: 'معاينة داكنة',
  logoLightPreview: 'معاينة فاتحة',
  logoUploading: 'جارٍ رفع الشعار...',
  logoUrlLabel: 'رابط الشعار / المسار',
  logoUrlPlaceholder: 'https://... أو /logo.png',
  logoUrlHint: 'الصق رابط صورة مباشر أو مساراً نسبياً ثم اضغط تطبيق',
  applyLogoUrl: 'تطبيق الرابط',
}

const en: AdminDictionary = {
  brand: 'Garden City L.L.C',
  loginTitle: 'Admin Sign In',
  loginSubtitle: 'Manage website content and media',
  username: 'Username',
  password: 'Password',
  showPassword: 'Show',
  hidePassword: 'Hide',
  signIn: 'Sign In',
  signingIn: 'Signing in...',
  logout: 'Logout',
  invalidCredentials: 'Invalid username or password',
  dashboard: 'Admin Dashboard',
  tabs: {
    site: 'Site Identity & Hero',
    services: 'Facilities & Services',
    gallery: 'Gallery Photos',
    contact: 'Contact & Map',
    inbox: 'Inbox & Security',
  },
  stats: {
    facilities: 'Total Facilities',
    gallery: 'Gallery Photos',
    unread: 'Unread Messages',
    updated: 'Last Updated',
  },
  save: 'Save',
  saveAll: 'Save Changes',
  saving: 'Saving...',
  saved: 'Saved successfully',
  error: 'Something went wrong. Try again.',
  loading: 'Loading...',
  upload: 'Upload Image',
  uploading: 'Uploading...',
  remove: 'Remove',
  add: 'Add',
  edit: 'Edit',
  delete: 'Delete',
  cancel: 'Cancel',
  confirmDelete: 'Are you sure you want to delete this?',
  reorderUp: 'Up',
  reorderDown: 'Down',
  markRead: 'Mark as read',
  markUnread: 'Mark as unread',
  noMessages: 'No messages yet',
  noGallery: 'No gallery photos yet',
  heroPreview: 'Hero background preview',
  heroImage: 'Hero Background Image',
  bilingualHint: 'Arabic / English',
  dropHint: 'Drag & drop images here, or choose files to upload',
  filterAll: 'All',
  filterUnread: 'Unread',
  securityTitle: 'Change Admin Credentials',
  securityHint: 'Update the dashboard username and password',
  newUsername: 'New username',
  newPassword: 'New password',
  confirmPassword: 'Confirm password',
  updateCredentials: 'Update Credentials',
  credentialsUpdated: 'Credentials updated successfully',
  passwordMismatch: 'Passwords do not match',
  mapPreview: 'Map preview',
  livePreview: 'Live Preview',
  hidePreview: 'Hide Preview',
  showPreview: 'Show Preview',
  unsaved: 'Unsaved Changes',
  restoreDefault: 'Restore Official Default Text',
  restored: 'Official default text restored',
  seedFacilities: 'Seed Default 4 Facilities',
  seeded: 'Default facilities seeded',
  inlineEdit: 'Quick edit',
  openEditor: 'Open editor',
  searchMessages: 'Search messages...',
  selected: 'selected',
  bulkDelete: 'Delete selected',
  previewLangAr: 'Arabic',
  previewLangEn: 'English',
  sectionHero: 'Hero',
  sectionOverview: 'Complex Overview',
  sectionFacilities: 'Recreational Facilities',
  chars: 'chars',
  dragHandle: 'Drag to reorder',
  websiteLogo: 'Website Logo',
  logoHint: 'PNG, JPG, JPEG, WebP, SVG — drag & drop or choose a file',
  removeLogo: 'Remove Logo',
  logoDarkPreview: 'Dark preview',
  logoLightPreview: 'Light preview',
  logoUploading: 'Uploading logo...',
  logoUrlLabel: 'Logo URL / Path',
  logoUrlPlaceholder: 'https://... or /logo.png',
  logoUrlHint: 'Paste a direct image URL or relative path, then apply',
  applyLogoUrl: 'Apply URL',
}

export function getAdminDict(language: Language): AdminDictionary {
  return language === 'ar' ? ar : en
}
