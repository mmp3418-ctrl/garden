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
    facilities: string
    services: string
    gallery: string
    contact: string
    inbox: string
  }
  stats: {
    facilities: string
    services: string
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
  noFacilities: string
  noServices: string
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
  iconPicker: string
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
    facilities: 'المرافق الترفيهية',
    services: 'الخدمات',
    gallery: 'معرض الصور',
    contact: 'وسائل التواصل',
    inbox: 'الوارد والأمان',
  },
  stats: {
    facilities: 'المرافق',
    services: 'الخدمات',
    gallery: 'صور المعرض',
    unread: 'غير مقروء',
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
  noFacilities: 'لا توجد مرافق بعد — أضف مرفقاً أو عبّئ الافتراضيات',
  noServices: 'لا توجد خدمات بعد — أضف خدمة جديدة',
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
  restoreDefault: 'استعادة النص الافتراضي',
  restored: 'تمت استعادة النص الافتراضي',
  seedFacilities: 'تعبئة 4 مرافق افتراضية',
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
  logoHint: 'اختر صورة الشعار (PNG, JPG, WebP, SVG) لرفعها مباشرة',
  removeLogo: 'حذف',
  logoDarkPreview: 'معاينة داكنة',
  logoLightPreview: 'معاينة فاتحة',
  logoUploading: 'جارٍ رفع الشعار...',
  iconPicker: 'اختيار الأيقونة',
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
    site: 'Site Identity',
    facilities: 'Facilities',
    services: 'Services',
    gallery: 'Gallery',
    contact: 'Contact',
    inbox: 'Inbox & Security',
  },
  stats: {
    facilities: 'Facilities',
    services: 'Services',
    gallery: 'Gallery',
    unread: 'Unread',
    updated: 'Last Updated',
  },
  save: 'Save',
  saveAll: 'Save Changes',
  saving: 'Saving...',
  saved: 'Saved successfully',
  error: 'Something went wrong. Try again.',
  loading: 'Loading...',
  upload: 'Upload Images',
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
  noFacilities: 'No facilities yet — add one or seed defaults',
  noServices: 'No services yet — add a new service',
  heroPreview: 'Hero background preview',
  heroImage: 'Hero Background Image',
  bilingualHint: 'Arabic / English',
  dropHint: 'Drag & drop images here, or choose files to upload',
  filterAll: 'Select all',
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
  logoHint: 'Choose a logo image (PNG, JPG, WebP, SVG) to upload',
  removeLogo: 'Remove',
  logoDarkPreview: 'Dark preview',
  logoLightPreview: 'Light preview',
  logoUploading: 'Uploading logo...',
  iconPicker: 'Icon Picker',
}

export function getAdminDict(language: Language): AdminDictionary {
  return language === 'ar' ? ar : en
}
