
// this class adapts car data formatted by a third party api to our internal car schema
class ExternalCarAdapter {
    constructor(externalCarData) {
        this.externalCarData = externalCarData;
    }

    // Adapts external format → internal Car schema
    async getAdaptedCars() {
        const externalCars = await this.externalCarData.fetchFleet();
        return externalCars.map(this._adaptCar);
    }

    _adaptCar(externalCar) {
        return {
            name: externalCar.vehicle_name,          // renamed field
            type: externalCar.category,               // renamed field
            location: externalCar.depot_location,     // renamed field
            pricePerDay: externalCar.daily_rate,      // renamed field
            seats: externalCar.passenger_capacity,    // renamed field
            transmission: externalCar.gearbox_type,  // renamed field
            availability: 'Available',
            description: externalCar.notes || '',
        };
    }
}

// this class generates mock external data to simulate third party api
class MockExternalCarData {
    async fetchFleet() {
        return [
            {
                vehicle_name: 'Toyota Corolla',
                category: 'Sedan',
                depot_location: 'Brisbane',
                daily_rate: 75,
                passenger_capacity: 5,
                gearbox_type: 'Automatic',
                notes: 'Fuel efficient city car'
            }
        ];
    }
}

module.exports = { ExternalCarAdapter, MockExternalCarData };