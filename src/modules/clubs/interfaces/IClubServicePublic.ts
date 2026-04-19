/**
 * Cross-context public API
 * Events modülü bu interface'i kullanarak Club bilgilerine erişir
 */
export interface IClubServicePublic {
    /**
     * Kulübün var olup olmadığını ve aktif olup olmadığını kontrol eder
     */
    verifyClubExists(clubId: string): Promise<boolean>;

    /**
     * Kullanıcının kulüpte belirli bir role sahip olup olmadığını kontrol eder
     */
    verifyUserHasRole(clubId: string, userId: string, minRole: string): Promise<boolean>;

    /**
     * Kulübün adını getirir (event listelerinde göstermek için)
     */
    getClubName(clubId: string): Promise<string | null>;
}
