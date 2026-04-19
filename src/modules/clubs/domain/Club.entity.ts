export class ClubEntity {
    constructor(
        public readonly id: string,
        public readonly name: string,
        private _description: string,
        private _logoUrl: string | null,
        private _isActive: boolean,
        public readonly createdAt: Date
    ) { }

    get description(): string {
        return this._description;
    }

    get logoUrl(): string | null {
        return this._logoUrl;
    }

    get isActive(): boolean {
        return this._isActive;
    }

    // Business logic - Kulüp güncelleme
    updateInfo(description: string, logoUrl?: string): void {
        if (!this._isActive) {
            throw new Error('Pasif kulüp güncellenemez');
        }
        this._description = description;
        if (logoUrl !== undefined) {
            this._logoUrl = logoUrl;
        }
    }

    // Business logic - Kulübü devre dışı bırak
    deactivate(): void {
        if (!this._isActive) {
            throw new Error('Kulüp zaten pasif');
        }
        this._isActive = false;
    }

    // Business logic - Kulübü aktif et
    activate(): void {
        if (this._isActive) {
            throw new Error('Kulüp zaten aktif');
        }
        this._isActive = true;
    }

    // Factory method - Yeni kulüp oluştur
    static create(params: {
        id: string;
        name: string;
        description: string;
        logoUrl?: string;
    }): ClubEntity {
        return new ClubEntity(
            params.id,
            params.name,
            params.description,
            params.logoUrl || null,
            true, // Yeni kulüpler aktif başlar
            new Date()
        );
    }
}
