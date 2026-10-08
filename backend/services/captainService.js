const captainModel = require('../models/Captain');

module.exports.createCaptain = async ({
    firstname, lastname, email, password, color, plate, capacity, vehicleType
}) => {
    if (!firstname || !email || !password || !color || !plate || !capacity || !vehicleType) {
        throw new Error('All fields are required');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const parsedCapacity = Number(capacity);

    if (isNaN(parsedCapacity) || parsedCapacity < 1) {
        throw new Error('Valid vehicle capacity is required');
    }

    const captain = await captainModel.create({
        fullname: {
            firstname: firstname.trim(),
            lastname: lastname ? lastname.trim() : ''
        },
        email: normalizedEmail,
        password,
        vehicle: {
            color: color.trim(),
            plate: plate.trim(),
            capacity: parsedCapacity,
            vehicleType
        }
    });

    return captain;
};
