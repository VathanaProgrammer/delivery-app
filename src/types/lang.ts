// src/types/lang.ts
export interface LangStrings {
  addEntryHeader: string;
  namePlaceholder: string;
  phonePlaceholder: string;
  addressPlaceholder: string;
  takePhoto: string;
  selectPhotos: string;
  submit: string;
  selectLanguage: string;
  close: string;
  submitting: string;
  logout: string;
  pleaseAddPhoto: string;
  welcomeBack: string;
  success: string;
  error: string;
  info: string;
  welcome: string;
  ok: string;
  entrySubmittedSuccess: string;
  entrySubmittedError: string;
  something_went_wrong: string;
  comment: string;
  drop_off: string;
  invoice_no: string;
  address: string;
  customer: string;
  cod: string;
  

  // Add these new keys for delivery
  deliveryConfirmed: string;
  confirmFailed: string;
}


export interface LangData {
  en: LangStrings;
  kh: LangStrings;
}
