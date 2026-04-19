/**
 * Cross-context public API
 * Diğer modüller bu interface'i kullanarak Event bilgilerine erişir
 */
export interface IEventServicePublic {
    /**
     * Etkinliğin var olup olmadığını kontrol eder
     */
    verifyEventExists(eventId: string): Promise<boolean>;

    /**
     * Etkinliğin başlığını getirir
     */
    getEventTitle(eventId: string): Promise<string | null>;

    /**
     * Kullanıcının etkinliğe katılıp katılmadığını kontrol eder
     */
    isUserAttending(eventId: string, userId: string): Promise<boolean>;
}
