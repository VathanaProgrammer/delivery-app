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
  call: string;
  all: string;
  pick_up: string;
  shipped: string;
  enter_comment: string;
  profile_update_success: string;
  home: string;
  confirm_pick_up: string;
  add_comment: string;
  Invalid_QR_code: string;
  This_order_is_already_delivered: string;
  total_count: string;
  hide_list: string;
  email: string;
  sign_in: string;
  password: string;

  // Add these new keys for delivery
  deliveryConfirmed: string;
  confirmFailed: string;
}


export interface LangData {
  en: LangStrings;
  kh: LangStrings;
}
