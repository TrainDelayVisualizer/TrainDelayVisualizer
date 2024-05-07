import { DelayCalculationUtils } from '../util/delay-calculation.utils';

describe('DelayCalculationUtils', () => {
    describe('calculateDelayInfo', () => {
        it('should calculate delay info correctly', () => {
            // Arrange
            const delayInSeconds = 150;

            // Act
            const result = DelayCalculationUtils.calculateDelayInfo(delayInSeconds);

            // Assert
            expect(result.delayMinutes).toBe(2);
            expect(result.delaySeconds).toBe(30);
            expect(result.delayColor).toBe('red');
        });

        it('should calculate delay info correctly for less than 1 minute delay', () => {
            // Arrange
            const delayInSeconds = 30;

            // Act
            const result = DelayCalculationUtils.calculateDelayInfo(delayInSeconds);

            // Assert
            expect(result.delayMinutes).toBe(0);
            expect(result.delaySeconds).toBe(30);
            expect(result.delayColor).toBe('green');
        });

        it('should calculate delay info correctly for 1 minute delay', () => {
            // Arrange
            const delayInSeconds = 60;

            // Act
            const result = DelayCalculationUtils.calculateDelayInfo(delayInSeconds);

            // Assert
            expect(result.delayMinutes).toBe(1);
            expect(result.delaySeconds).toBe(0);
            expect(result.delayColor).toBe('orange');
        });
    });

    describe('getDelayColor', () => {
        it('should return "red" for delay greater than or equal to 2 minutes', () => {
            // Arrange
            const delayInMinutes = 2;

            // Act
            const result = DelayCalculationUtils.getDelayColor(delayInMinutes);

            // Assert
            expect(result).toBe('red');
        });

        it('should return "orange" for delay greater than or equal to 1 minute', () => {
            // Arrange
            const delayInMinutes = 1;

            // Act
            const result = DelayCalculationUtils.getDelayColor(delayInMinutes);

            // Assert
            expect(result).toBe('orange');
        });

        it('should return "green" for delay less than 1 minute', () => {
            // Arrange
            const delayInMinutes = 0;

            // Act
            const result = DelayCalculationUtils.getDelayColor(delayInMinutes);

            // Assert
            expect(result).toBe('green');
        });
    });
});