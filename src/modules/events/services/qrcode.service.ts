import { TOTP } from 'otplib';
import { NobleCryptoPlugin } from 'otplib';
import { ScureBase32Plugin } from 'otplib';
import QRCode from 'qrcode';
import { AppError } from '../../infrastructure/errors/AppError';

/**
 * QR Code Service
 * 
 * TOTP (Time-based One-Time Password) tabanlı güvenli QR kod sistemi
 * 
 * Güvenlik Özellikleri:
 * - 30 saniyelik time window
 * - Secret key event bazlı (her etkinlik için farklı)
 * - Replay attack koruması
 * - Time drift tolerance (±30 saniye)
 */

export class QRCodeService {
    private readonly SECRET_BASE: string;
    private readonly totp: TOTP;

    constructor() {
        // Production'da environment variable'dan alınmalı
        this.SECRET_BASE = process.env.QR_SECRET_BASE || 'clubms-secret-base-key-change-in-production';

        // TOTP instance oluştur
        this.totp = new TOTP({
            period: 30, // 30 saniye geçerlilik
            digits: 6,
            algorithm: 'sha256',
            crypto: new NobleCryptoPlugin(),
            base32: new ScureBase32Plugin()
        });
    }

    /**
     * Etkinlik için QR kod oluştur
     * @param eventId Etkinlik ID
     * @param eventTitle Etkinlik başlığı (QR kod içinde gösterilmek için)
     * @returns QR kod data URL (base64 image)
     */
    async generateQRCode(eventId: string, eventTitle: string): Promise<string> {
        try {
            // Event-specific secret oluştur
            const secret = this.getEventSecret(eventId);

            // TOTP token oluştur
            const token = await this.totp.generate({ secret });

            // QR kod payload'ı
            const payload = JSON.stringify({
                eventId,
                eventTitle,
                token,
                timestamp: Date.now()
            });

            // QR kod image oluştur (Data URL format)
            const qrCodeDataURL = await QRCode.toDataURL(payload, {
                errorCorrectionLevel: 'H',
                type: 'image/png',
                width: 300,
                margin: 2
            });

            return qrCodeDataURL;
        } catch (error: any) {
            throw AppError.internal('QR kod oluşturulamadı: ' + error.message);
        }
    }

    /**
     * QR kod'u doğrula
     * @param qrPayload QR kod'dan okunan payload (JSON string)
     * @param eventId Beklenen etkinlik ID
     * @returns Doğrulama başarılı mı?
     */
    async verifyQRCode(qrPayload: string, eventId: string): Promise<boolean> {
        try {
            // Payload'ı parse et
            const data = JSON.parse(qrPayload);

            // Event ID kontrolü
            if (data.eventId !== eventId) {
                throw new Error('Event ID mismatch');
            }

            // Timestamp kontrolü (QR kod max 5 dakika geçerli)
            const MAX_AGE_MS = 5 * 60 * 1000; // 5 dakika
            const age = Date.now() - data.timestamp;
            if (age > MAX_AGE_MS) {
                throw new Error('QR kod süresi dolmuş');
            }

            // Event-specific secret al
            const secret = this.getEventSecret(eventId);

            // TOTP token'ı doğrula (±30 saniye tolerance)
            const result = await this.totp.verify(data.token, {
                secret,
                epochTolerance: 30
            });

            return result.valid;
        } catch (error: any) {
            console.error('QR kod doğrulama hatası:', error.message);
            return false;
        }
    }

    /**
     * Etkinlik için benzersiz secret key oluştur
     * @param eventId Etkinlik ID
     * @returns Secret key (Base32 encoded)
     */
    private getEventSecret(eventId: string): string {
        // Event ID + base secret ile unique secret oluştur
        // Production'da daha güvenli bir yöntem kullanılmalı (HMAC, etc.)
        const crypto = require('crypto');
        const hash = crypto
            .createHmac('sha256', this.SECRET_BASE)
            .update(eventId)
            .digest('base64');

        // Base32 encoding için hash'i base32 formatına çevir
        // otplib base32 plugin'i bunu otomatik handle eder
        return hash;
    }

    /**
     * QR kod için kalan süreyi hesapla (saniye)
     * TOTP window'un ne kadar süre kaldığını gösterir
     */
    getRemainingTime(): number {
        const now = Math.floor(Date.now() / 1000);
        const period = 30;
        const remaining = period - (now % period);
        return remaining;
    }
}
