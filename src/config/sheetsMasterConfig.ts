/**
 * MASTER GOOGLE SPREADSHEET CONFIGURATION
 * ========================================
 * Masukkan URL Google Apps Script Web App Anda di variabel webAppUrl di bawah ini.
 * 
 * Begitu URL dipasang di sini:
 * - SEMUA perangkat (HP, Laptop, Tablet, PC) otomatis 100% terhubung ke Google Spreadsheet yang sama!
 * - Tidak perlu scan QR Code atau salin link lagi di perangkat lain.
 * - Saat aplikasi dibuka di perangkat mana pun, data terbaru langsung disinkronkan secara otomatis.
 */

export const MASTER_SHEETS_CONFIG = {
  // Masukkan Web App URL yang berakhiran /exec di sini
  webAppUrl: "https://script.google.com/macros/s/AKfycbzPeClSNHrpNqp67hHrnEWIxdmJLG9ON8LRo02kQyzzZC3eyXkhZJpHHNjvU7GQCTM/exec",

  // Tautan File Google Spreadsheet Yayasan ("ASET YAYASAN")
  sheetDocUrl: "https://docs.google.com/spreadsheets/d/1hPpJ7h30ffh8yL_E7E3_WNXp4gj-HGgTDAZ5DLmYP8A/edit",

  // Otomatis aktifkan sinkronisasi otomatis
  autoSync: true
};
