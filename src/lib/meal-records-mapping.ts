export type MealRecordStatus = 'bien' | 'regular' | 'mal';
export type EatingType = 'good' | 'normal' | 'poor';

export function mapMealStatusToEatingType(status: MealRecordStatus): EatingType {
    switch (status) {
        case 'bien':
            return 'good';
        case 'regular':
            return 'normal';
        case 'mal':
            return 'poor';
    }
}
